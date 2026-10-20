import type { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream';

import type { Classification } from './classification';

export const REFUSAL =
  "I only answer questions about Daniel — his work, his projects, and how to reach him. I can't help with anything else here.";

/**
 * The chat's response body: waits for the scope verdict, then either refuses or
 * streams the model's answer, and records the exchange exactly once however it
 * ends — answered, refused, failed, or abandoned by the visitor (issue 13).
 *
 * Every refusal used to vanish. The refusal path closed the response and the
 * `finally` closed it again, which throws before the record; a visitor leaving
 * mid-answer broke it the same way. So nothing here touches the controller
 * directly: `send` and `end` know when the response is already over.
 */
export function answerStream({
  stream,
  classification,
  record,
}: {
  stream: MessageStream;
  classification: Promise<Classification>;
  record: (answer: string, label: string) => void;
}): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let answer = '';
  let over = false;

  // The SDK raises an unhandled rejection on abort unless someone is listening.
  // Aborting is expected here — on a refusal and when the visitor leaves — so
  // this listener only marks it as handled.
  stream.on('abort', () => {});

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => {
        if (over) return;
        controller.enqueue(encoder.encode(text));
      };
      const end = () => {
        if (over) return;
        over = true;
        controller.close();
      };

      try {
        // Nothing reaches the visitor until scope is settled. `unknown` passes
        // — see classifier.ts on why this fails open.
        if ((await classification).verdict === 'refuse') {
          stream.abort();
          // Out-of-scope attempts are worth keeping: they are the only signal
          // that someone is probing the endpoint.
          answer = REFUSAL;
          send(answer);
          return;
        }

        for await (const event of stream) {
          if (over) break;
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            answer += event.delta.text;
            send(event.delta.text);
          }
        }
        if (over) return;

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
          send(answer ? '\n\n(I had to stop there.)' : 'I am not able to answer that one.');
        }
      } catch {
        send(
          answer
            ? '\n\n(Something interrupted me mid-answer.)'
            : 'Something went wrong reaching the model, so I would rather not guess.',
        );
      } finally {
        end();
        // Best-effort, and deliberately not awaited into the response path:
        // logging must never take the agent down (issue 03). `classification`
        // never rejects — every failure is already a label of its own.
        void classification.then(({ label }) => record(answer, label));
      }
    },

    // The visitor went away. Stop paying for an answer nobody will read; the
    // `finally` above still records what was said up to here.
    cancel() {
      over = true;
      stream.abort();
    },
  });
}
