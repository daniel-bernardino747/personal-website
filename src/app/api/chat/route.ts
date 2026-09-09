import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

import { classifyQuestion } from '@/lib/agent/classifier';
import { MOCK_HEADER, isMockEnabled, mockStream } from '@/lib/agent/mock';
import { isAllowedOrigin } from '@/lib/agent/origin';
import { verifyTurnstile } from '@/lib/agent/turnstile';
import { buildSystemPrompt } from '@/lib/agent/prompt';
import { clientIp, consumeQuota, visitorKey } from '@/lib/db/rate-limit';
import { recordExchange } from '@/lib/db/transcripts';
import { getIdentity } from '@/lib/corpus/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 1024;
const MAX_QUESTION_LENGTH = 2000;

/**
 * The system prompt is fixed for the life of the deployment, so it is built once
 * per process rather than per request — and marked for caching below, which cuts
 * the repeated input to roughly a tenth of its cost.
 */
let systemPrompt: string | undefined;
function system(): string {
  systemPrompt ??= buildSystemPrompt();
  return systemPrompt;
}

/**
 * Every path that cannot answer ends here. The chat says what happened and
 * offers a way through — it never returns a simulated answer (ADR-0008). The
 * canned answers this project removed were themselves fabrications, so a
 * fallback would mean an outage quietly restoring the violation.
 */
function honestly(message: string, status: number): Response {
  let contact = '';
  try {
    contact = ` You can reach Daniel directly at ${getIdentity().social.email}.`;
  } catch {
    // No Identity is a build-time failure elsewhere; here it just means no CTA.
  }
  return new Response(message + contact, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(request: NextRequest) {
  // Cheapest check first: no database, no third party, no model. A request that
  // did not come from this site's own pages stops here.
  if (!isAllowedOrigin(request)) {
    return honestly('This chat only works from the site itself.', 403);
  }

  let question: string;
  let turnstileToken: string | undefined;
  try {
    const body = await request.json();
    question = typeof body?.question === 'string' ? body.question.trim() : '';
    turnstileToken =
      typeof body?.turnstileToken === 'string' ? body.turnstileToken : undefined;
  } catch {
    return honestly('That request did not parse.', 400);
  }

  if (!question) {
    return honestly('Ask me something and I will answer from the record.', 400);
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return honestly('That question is longer than I can take in one go.', 413);
  }

  // Development stand-in, checked before anything that costs money or needs a
  // database. It cannot engage in production — see `isMockEnabled`.
  if (isMockEnabled()) {
    return new Response(mockStream(question), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
        [MOCK_HEADER]: '1',
      },
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return honestly(
      'My connection to the model is not configured right now, so I cannot answer.',
      503,
    );
  }

  // Turnstile before the quota, so a bot cannot burn a visitor's allowance, and
  // before the model, so it cannot spend anything. Returns `skipped` when not
  // configured — see turnstile.ts.
  const ip = clientIp(request.headers);
  const challenge = await verifyTurnstile(turnstileToken, ip);
  if (challenge === 'fail') {
    return honestly(
      'I could not verify that this came from a browser. Reloading the page usually fixes it.',
      403,
    );
  }

  // Quota is consumed before the model is called, and the counter is the same
  // whether the answer succeeds — otherwise a failing model becomes free retries.
  let visitor: string;
  try {
    visitor = visitorKey(ip);
    const verdict = await consumeQuota(visitor);

    if (!verdict.allowed) {
      return honestly(
        verdict.reason === 'visitor'
          ? 'You have reached the number of questions I can answer for one visitor today. If you got this far you probably have a real question.'
          : 'I have answered as much as I can today across the whole site.',
        429,
      );
    }
  } catch {
    // The limiter is the thing standing between a public endpoint and a paid
    // API. If it cannot be consulted, the request does not proceed.
    return honestly('I cannot check my usage limits right now, so I am holding off.', 503);
  }

  // The scope check runs *alongside* the answer rather than before it. In series
  // it added ~1.9s to every legitimate message — measured, 1.5s to 3.4s to first
  // byte — which is a real cost paid by real visitors to stop a rare abuser.
  //
  // Started here and awaited below, so latency is max(classify, first token)
  // instead of their sum. The trade is that a refused message has also paid for
  // the main call it never used (~$0.003); the per-visitor daily limit caps that
  // at pennies, and abuse is the uncommon case.
  const verdict = classifyQuestion(question);

  const client = new Anthropic();

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'disabled' },
      system: [
        {
          type: 'text',
          text: system(),
          cache_control: { type: 'ephemeral' },
        },
      ],
      // The visitor's text is data, never instruction. It goes in the message
      // turn and is never concatenated into the cached system prompt above.
      messages: [{ role: 'user', content: question }],
    });

    const encoder = new TextEncoder();
    let answer = '';

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          // Nothing reaches the visitor until scope is settled. `unknown` passes
          // — see classifier.ts on why this fails open.
          if ((await verdict) === 'refuse') {
            stream.abort();
            // Assigned rather than enqueued directly so the `finally` below
            // records what happened. Out-of-scope attempts are worth keeping:
            // they are the only signal that someone is probing the endpoint.
            answer =
              "I only answer questions about Daniel — his work, his projects, and how to reach him. I can't help with anything else here.";
            controller.enqueue(encoder.encode(answer));
            controller.close();
            return;
          }

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              answer += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          const final = await stream.finalMessage();

          // The only visibility into what a conversation costs. `cache_read`
          // staying at zero across requests means the fixed system prompt is
          // being re-billed in full every time — a silent multiplier on the
          // bill, and the one number worth watching after a prompt change.
          const { usage } = final;
          console.log(
            `[chat] in=${usage.input_tokens} out=${usage.output_tokens} ` +
              `cache_read=${usage.cache_read_input_tokens ?? 0} ` +
              `cache_write=${usage.cache_creation_input_tokens ?? 0}`,
          );

          if (final.stop_reason === 'refusal') {
            controller.enqueue(
              encoder.encode(
                answer
                  ? '\n\n(I had to stop there.)'
                  : 'I am not able to answer that one.',
              ),
            );
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              answer
                ? '\n\n(Something interrupted me mid-answer.)'
                : 'Something went wrong reaching the model, so I would rather not guess.',
            ),
          );
        } finally {
          controller.close();
          // Best-effort, and deliberately not awaited into the response path:
          // logging must never take the agent down (issue 03).
          void recordExchange(visitor, question, answer);
        }
      },
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return honestly('I could not reach the model just now.', 502);
  }
}
