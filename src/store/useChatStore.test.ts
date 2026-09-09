import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from './useChatStore';

/**
 * Regression tests for interleaved streaming.
 *
 * The original `appendToLastMessage` wrote to whatever happened to be last in the
 * array. That is correct only while exactly one stream is running. Two overlapping
 * streams — a quick action clicked on the home page, then another clicked on
 * `/chat` before the first finished — produce this: stream A opens bubble 1 and
 * starts writing; stream B opens bubble 2; and from that moment A's chunks land
 * in B's bubble too, because "last" moved. The result is one answer with two
 * answers shuffled into it, word by word.
 */
beforeEach(() => {
  useChatStore.setState({ messages: [], initialQuery: null });
});

describe('the chat store', () => {
  it('appends a chunk to the message it was addressed to', () => {
    const { addMessage } = useChatStore.getState();
    addMessage({ role: 'ai', text: '' });
    const id = useChatStore.getState().messages[0].id;

    useChatStore.getState().appendToMessage(id, 'hello ');
    useChatStore.getState().appendToMessage(id, 'world');

    expect(useChatStore.getState().messages[0].text).toBe('hello world');
  });

  it('keeps two overlapping streams in their own bubbles', () => {
    const { addMessage } = useChatStore.getState();

    addMessage({ role: 'ai', text: '' });
    const first = useChatStore.getState().messages[0].id;

    useChatStore.getState().appendToMessage(first, 'A1 ');

    // A second stream opens its own bubble while the first is still writing.
    addMessage({ role: 'ai', text: '' });
    const second = useChatStore.getState().messages[1].id;

    // Interleave them, the way two live streams would.
    useChatStore.getState().appendToMessage(second, 'B1 ');
    useChatStore.getState().appendToMessage(first, 'A2 ');
    useChatStore.getState().appendToMessage(second, 'B2');
    useChatStore.getState().appendToMessage(first, 'A3');

    const [a, b] = useChatStore.getState().messages;
    expect(a.text).toBe('A1 A2 A3');
    expect(b.text).toBe('B1 B2');
  });

  it('ignores a chunk for a message that no longer exists', () => {
    const { addMessage } = useChatStore.getState();
    addMessage({ role: 'ai', text: 'kept' });

    // Clearing history mid-stream must not resurrect the message or throw.
    useChatStore.getState().appendToMessage(999_999, 'orphan');

    expect(useChatStore.getState().messages).toHaveLength(1);
    expect(useChatStore.getState().messages[0].text).toBe('kept');
  });

  it('gives concurrently added messages distinct ids', () => {
    const { addMessage } = useChatStore.getState();

    // Ids came from `Date.now()`, which collides when two bubbles open in the
    // same millisecond — and a collision would put both streams back in one
    // bubble by another route.
    for (let i = 0; i < 50; i += 1) addMessage({ role: 'ai', text: '' });

    const ids = useChatStore.getState().messages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
