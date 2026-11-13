import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

import { answerStream } from '@/lib/agent/answer-stream';
import { classifyQuestion } from '@/lib/agent/classifier';
import { MOCK_HEADER, isMockEnabled, mockStream } from '@/lib/agent/mock';
import { isAllowedOrigin } from '@/lib/agent/origin';
import { verifyTurnstile } from '@/lib/agent/turnstile';
import { buildSystemPrompt } from '@/lib/agent/prompt';
import { clientIp, consumeQuota, visitorKey } from '@/lib/db/rate-limit';
import { recordExchange } from '@/lib/db/transcripts';
import { getIdentity } from '@/lib/corpus/site';
import { isLocale, type Locale } from '@/i18n/routing';

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
const systemPrompts = new Map<Locale, string>();
function system(locale: Locale): string {
  let prompt = systemPrompts.get(locale);
  if (!prompt) {
    prompt = buildSystemPrompt(locale);
    systemPrompts.set(locale, prompt);
  }
  return prompt;
}

/**
 * What the route says when it cannot answer, in the page's language. The
 * English is what it always said.
 */
const SAY = {
  en: {
    contact: (email: string) => ` You can reach Daniel directly at ${email}.`,
    origin: 'This chat only works from the site itself.',
    parse: 'That request did not parse.',
    empty: 'Ask me something and I will answer from the record.',
    long: 'That question is longer than I can take in one go.',
    noKey: 'My connection to the model is not configured right now, so I cannot answer.',
    turnstile: 'I could not verify that this came from a browser. Reloading the page usually fixes it.',
    visitorQuota: 'You have reached the number of questions I can answer for one visitor today. If you got this far you probably have a real question.',
    siteQuota: 'I have answered as much as I can today across the whole site.',
    limiter: 'I cannot check my usage limits right now, so I am holding off.',
    model: 'I could not reach the model just now.',
  },
  pt: {
    contact: (email: string) => ` Você pode falar direto com o Daniel em ${email}.`,
    origin: 'Este chat só funciona a partir do próprio site.',
    parse: 'Não consegui ler esse pedido.',
    empty: 'Me pergunte algo e eu respondo a partir do que está registrado.',
    long: 'Essa pergunta é maior do que consigo receber de uma vez.',
    noKey: 'Minha conexão com o modelo não está configurada agora, então não consigo responder.',
    turnstile: 'Não consegui confirmar que isso veio de um navegador. Recarregar a página costuma resolver.',
    visitorQuota: 'Você chegou ao limite de perguntas que consigo responder por visitante hoje. Se chegou até aqui, provavelmente tem uma pergunta de verdade: fale com ele direto.',
    siteQuota: 'Já respondi tudo o que consigo hoje no site inteiro.',
    limiter: 'Não consigo checar meus limites de uso agora, então vou esperar.',
    model: 'Não consegui falar com o modelo agora.',
  },
} satisfies Record<Locale, unknown>;

/**
 * Every path that cannot answer ends here. The chat says what happened and
 * offers a way through — it never returns a simulated answer (ADR-0008). The
 * canned answers this project removed were themselves fabrications, so a
 * fallback would mean an outage quietly restoring the violation.
 */
function honestly(message: string, status: number, locale: Locale = 'en'): Response {
  let contact = '';
  try {
    contact = SAY[locale].contact(getIdentity().social.email);
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
    return honestly(SAY.en.origin, 403);
  }

  let question: string;
  let turnstileToken: string | undefined;
  // The page's language (ADR-0015); anything unknown is English, as before.
  let locale: Locale = 'en';
  try {
    const body = await request.json();
    question = typeof body?.question === 'string' ? body.question.trim() : '';
    turnstileToken =
      typeof body?.turnstileToken === 'string' ? body.turnstileToken : undefined;
    if (isLocale(body?.locale)) locale = body.locale;
  } catch {
    return honestly(SAY.en.parse, 400);
  }
  const say = SAY[locale];

  if (!question) {
    return honestly(say.empty, 400, locale);
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return honestly(say.long, 413, locale);
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
    return honestly(say.noKey, 503, locale);
  }

  // Turnstile before the quota, so a bot cannot burn a visitor's allowance, and
  // before the model, so it cannot spend anything. Returns `skipped` when not
  // configured — see turnstile.ts.
  const ip = clientIp(request.headers);
  const challenge = await verifyTurnstile(turnstileToken, ip);
  if (challenge === 'fail') {
    return honestly(say.turnstile, 403, locale);
  }

  // Quota is consumed before the model is called, and the counter is the same
  // whether the answer succeeds — otherwise a failing model becomes free retries.
  let visitor: string;
  try {
    visitor = visitorKey(ip);
    const verdict = await consumeQuota(visitor);

    if (!verdict.allowed) {
      return honestly(verdict.reason === 'visitor' ? say.visitorQuota : say.siteQuota, 429, locale);
    }
  } catch (error) {
    // The limiter is the thing standing between a public endpoint and a paid
    // API. If it cannot be consulted, the request does not proceed.
    // Logged, because the visitor's message cannot say which of the causes it
    // was — no salt, no DATABASE_URL, an unreachable host, missing tables — and
    // the first outage on Coolify (13/11/2026) left nothing to read. The
    // message names hosts and tables, never the connection string.
    const err = error as { name?: string; code?: string; message?: string };
    console.error(`[chat] limiter unavailable: ${err?.name ?? 'Error'} ${err?.code ?? ''} ${err?.message ?? error}`);
    return honestly(say.limiter, 503, locale);
  }

  // The scope check runs *alongside* the answer rather than before it. In series
  // it added ~1.9s to every legitimate message — measured, 1.5s to 3.4s to first
  // byte — which is a real cost paid by real visitors to stop a rare abuser.
  //
  // Started here and awaited in `answerStream`, so latency is max(classify,
  // first token) instead of their sum. The trade is that a refused message has
  // also paid for the main call it never used (~$0.003); the per-visitor daily
  // limit caps that at pennies, and abuse is the uncommon case.
  const classification = classifyQuestion(question);

  const client = new Anthropic();

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'disabled' },
      system: [
        {
          type: 'text',
          text: system(locale),
          cache_control: { type: 'ephemeral' },
        },
      ],
      // The visitor's text is data, never instruction. It goes in the message
      // turn and is never concatenated into the cached system prompt above.
      messages: [{ role: 'user', content: question }],
    });

    const body = answerStream({
      stream,
      classification,
      locale,
      record: (answer, label) => recordExchange(visitor, question, answer, label),
    });

    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return honestly(say.model, 502, locale);
  }
}
