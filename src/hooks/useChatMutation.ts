'use client';

import { useTurnstile } from '@/components/chat/useTurnstile';
import { useChatStore } from '@/store/useChatStore';
import { useCallback, useState } from 'react';

/**
 * Sends a question to the agent and streams the answer into the store.
 *
 * This stopped being a react-query `useMutation` when streaming arrived: a
 * mutation resolves once with a value, and what is needed here is a token
 * arriving at a time. The shape kept from the old hook is the one the components
 * already use — `mutate` and `isPending`.
 *
 * `isPending` is true only until the first token lands. After that the answer is
 * visibly arriving, so the typing indicator would be competing with the text.
 */
export function useChatMutation() {
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToMessage = useChatStore((state) => state.appendToMessage);
  const getTurnstileToken = useTurnstile();
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(
    async (question: string) => {
      setIsPending(true);

      // The id of the bubble this call owns. Every chunk is addressed to it, so
      // a second stream opening its own bubble cannot capture this one's text —
      // the interleaving bug that produced one answer with two shuffled into it.
      let bubbleId: number | null = null;

      /** Opens the assistant bubble on the first token, not before. */
      const open = () => {
        if (bubbleId !== null) return;
        setIsPending(false);
        addMessage({ role: 'ai', text: '' });
        const { messages } = useChatStore.getState();
        bubbleId = messages[messages.length - 1].id;
      };

      /** Writes into this call's own bubble, wherever it now sits. */
      const write = (chunk: string) => {
        open();
        if (bubbleId !== null) appendToMessage(bubbleId, chunk);
      };

      try {
        // Resolves undefined when Turnstile is not configured, which is also
        // when the server skips the check.
        const turnstileToken = await getTurnstileToken();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, turnstileToken }),
        });

        // Every non-OK path from the route is a plain-text honest message —
        // never a canned answer standing in for one (ADR-0008). It is shown as
        // the reply, because that is what it is.
        if (!response.ok || !response.body) {
          const message = (await response.text().catch(() => '')).trim();
          write(
            message || 'Something went wrong, and I would rather say so than guess.',
          );
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;

          write(chunk);
        }

        // A stream that closed without a single token still needs a reply in the
        // thread rather than an empty bubble or silence.
        if (bubbleId === null) {
          write('I came back with nothing to say, which is a bug.');
        }
      } catch {
        write(
          'I could not reach the server just now. Worth trying again in a moment.',
        );
      } finally {
        setIsPending(false);
      }
    },
    [addMessage, appendToMessage, getTurnstileToken],
  );

  return { mutate, isPending };
}
