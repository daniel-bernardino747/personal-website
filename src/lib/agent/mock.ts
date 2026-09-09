import 'server-only';

import { buildChatAnswers } from '@/lib/chat/answers';
import { getCorpus } from '@/lib/corpus/site';

/**
 * A local stand-in for the agent, so the chat UI can be worked on without
 * spending a cent.
 *
 * **This is the thing this project spent weeks removing**, so it is built to be
 * incapable of coming back. Two properties keep it honest:
 *
 * 1. It cannot run in production. `NODE_ENV === 'production'` disables it
 *    outright, before the opt-in flag is even read. The Dockerfile sets that,
 *    so a deployed image cannot mock no matter what variables are set on it.
 *    Guarded by `mock.test.ts`.
 * 2. It invents nothing. Every answer comes from `buildChatAnswers`, which reads
 *    the Featured Corpus — the same records the real agent is given. A mocked
 *    reply is a real claim, phrased plainly, so a screenshot taken while
 *    developing is not a fabrication (ADR-0003).
 *
 * What it does simulate is the *shape* of a real exchange: a pause before the
 * first token, then text arriving in pieces. That is what makes it useful for
 * debugging the streaming client, the scroll behaviour and the empty-bubble
 * state, which is where UI bugs actually live.
 */
export const MOCK_HEADER = 'X-Chat-Mock';

/**
 * Read per call rather than at module load, so the pacing can be changed in
 * `.env.local` and picked up on the next request instead of the next restart —
 * and so tests can run it with the delays at zero.
 *
 * `CHAT_MOCK_DELAY_MS` stands in for the model's latency before the first token
 * (measured at ~1.5s warm in production); `CHAT_MOCK_CHUNK_MS` is the gap
 * between chunks after that.
 */
function pacing() {
  return {
    firstToken: Number(process.env.CHAT_MOCK_DELAY_MS ?? 900),
    chunk: Number(process.env.CHAT_MOCK_CHUNK_MS ?? 35),
  };
}

/**
 * True only when explicitly opted into, outside production.
 *
 * The production check comes first and is not overridable. `CHAT_MOCK` is a
 * developer convenience; it is not a switch anyone can flip on a live site.
 */
export function isMockEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.CHAT_MOCK === '1';
}

/** Picks the Corpus-derived answer closest to the question. */
function answerFor(question: string): string {
  const answers = buildChatAnswers(getCorpus());
  const asked = question.toLowerCase();

  const match =
    answers.find((a) => a.phrase.toLowerCase() === asked) ??
    answers.find((a) => asked.includes(a.id)) ??
    answers.find((a) =>
      a.phrase
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4)
        .some((w) => asked.includes(w)),
    );

  if (match) return match.response;

  // No canned "I'm just a mock" prose: say what is true, in the shape the real
  // agent uses when the Corpus is silent.
  const suggestions = answers.map((a) => `• ${a.phrase}`).join('\n');
  return `I don't have that recorded.\n\nWhat I can answer from the record:\n\n${suggestions}`;
}

/**
 * Streams a Corpus answer in chunks, pausing like a real completion would.
 * Splits on whitespace so words arrive whole, which is what the real stream
 * looks like closely enough for UI work.
 */
export function mockStream(question: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const text = answerFor(question);
  const chunks = text.match(/\S+\s*/g) ?? [text];
  const { firstToken, chunk: chunkDelay } = pacing();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      if (firstToken > 0) {
        await new Promise((resolve) => setTimeout(resolve, firstToken));
      }

      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        if (chunkDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, chunkDelay));
        }
      }

      controller.close();
    },
  });
}
