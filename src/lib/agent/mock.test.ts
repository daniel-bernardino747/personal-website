import { afterEach, describe, expect, it } from 'vitest';

import { isMockEnabled } from './mock';
import { getCorpus } from '@/lib/corpus/site';
import { buildChatAnswers } from '@/lib/chat/answers';

/**
 * The mock agent is the one piece of this system that could quietly undo the
 * whole effort: a chat answering from something other than the live Corpus is
 * exactly what `src/data/responses.ts` was, and removing it is why this project
 * exists. These tests are the reason it is safe to keep around.
 */
const original = { NODE_ENV: process.env.NODE_ENV, CHAT_MOCK: process.env.CHAT_MOCK };

// The mock deliberately paces itself like a real completion; these tests are
// about what it says, not how slowly, so they run it with the delays off.
process.env.CHAT_MOCK_DELAY_MS = '0';
process.env.CHAT_MOCK_CHUNK_MS = '0';

function setEnv(nodeEnv: string | undefined, chatMock: string | undefined) {
  // Plain assignment, not `Object.defineProperty`: `process.env` is a proxy that
  // rejects a partial descriptor with "only accepts a configurable, writable,
  // and enumerable data descriptor". The cast is only to get past NODE_ENV being
  // typed read-only; it is writable at runtime.
  const env = process.env as Record<string, string | undefined>;
  if (nodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = nodeEnv;
  if (chatMock === undefined) delete env.CHAT_MOCK;
  else env.CHAT_MOCK = chatMock;
}

afterEach(() => setEnv(original.NODE_ENV, original.CHAT_MOCK));

describe('the mock agent', () => {
  it('cannot be enabled in production, even when asked for explicitly', () => {
    setEnv('production', '1');
    expect(isMockEnabled()).toBe(false);
  });

  it('stays off in development unless opted into', () => {
    setEnv('development', undefined);
    expect(isMockEnabled()).toBe(false);

    setEnv('development', '0');
    expect(isMockEnabled()).toBe(false);

    setEnv('development', 'true');
    // Only the exact string '1' counts — a typo must fail closed, not silently
    // serve mocked answers while someone believes they are testing the agent.
    expect(isMockEnabled()).toBe(false);
  });

  it('turns on with the exact opt-in outside production', () => {
    setEnv('development', '1');
    expect(isMockEnabled()).toBe(true);
  });

  it('answers only from the Featured Corpus, inventing nothing', async () => {
    setEnv('development', '1');
    const { mockStream } = await import('./mock');

    const answers = buildChatAnswers(getCorpus());
    const target = answers.find((a) => a.id === 'projects');
    expect(target).toBeTruthy();

    const stream = mockStream(target!.phrase);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    // Byte-identical to what the Corpus produced. If the mock ever grows prose of
    // its own, this fails — which is the point.
    expect(text).toBe(target!.response);
  });

  it('refuses rather than improvising when the question has no match', async () => {
    setEnv('development', '1');
    const { mockStream } = await import('./mock');

    const stream = mockStream('what is his favourite band');
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("I don't have that recorded");
  });
});
