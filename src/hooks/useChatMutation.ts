'use client';

import { useIdentity } from '@/components/IdentityProvider';
import { buildInitialResponses } from '@/data/responses';
import { useChatStore } from '@/store/useChatStore';
import { useMutation } from '@tanstack/react-query';

export function useChatMutation() {
  const identity = useIdentity();
  const addMessage = useChatStore((state) => state.addMessage);

  return useMutation({
    mutationKey: ['chat-ai-response'],
    mutationFn: async (query: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const responses = buildInitialResponses(identity);
      const entryByPhrase = Object.values(responses).find(r => r.phrase === query);
      const entryByLabel = responses[query];
      const entry = entryByPhrase || entryByLabel;

      return entry 
        ? entry.response 
        : `Thanks for asking about "${query}"! Feel free to ask me about Me, Projects, Skills, Fun, or Contact.`;
    },
    onSuccess: (responseText) => {
      addMessage({ role: 'ai', text: responseText });
    },
  });
}
