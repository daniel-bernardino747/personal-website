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

  // Subscribed now, not after the verdict. The SDK's iterator only hears events
  // emitted after it is created, so one made later would wait forever on a
  // stream that already failed or was aborted while the classifier ran. This
  // one queues what arrives in the meantime and ends instead of hanging. It
  // also listens for `error` and `abort`, which keeps the SDK from raising an
  // unhandled rejection when either is expected: a refusal, a visitor leaving.
  const events = stream[Symbol.asyncIterator]();

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
        const { verdict } = await classification;
        if (over) return;

        if (verdict === 'refuse') {
          stream.abort();
          // Out-of-scope attempts are worth keeping: they are the only signal
          // that someone is probing the endpoint.
          answer = REFUSAL;
          send(answer);
          return;
        }

        for (let next = await events.next(); !next.done && !over; next = await events.next()) {
          const event = next.value;
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
        // Recorded before the response is closed, so nothing the close does can
        // skip it. Best-effort, and deliberately not awaited into the response
        // path: logging must never take the agent down (issue 03).
        // `classification` never rejects — every failure is a label of its own.
        void classification.then(({ label }) => record(answer, label));
        end();
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
