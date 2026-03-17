'use client';

import { INITIAL_RESPONSES } from '@/data/responses';
import { useChatStore } from '@/store/useChatStore';
import { useMutation } from '@tanstack/react-query';

export function useChatMutation() {
  const addMessage = useChatStore((state) => state.addMessage);

  return useMutation({
    mutationKey: ['chat-ai-response'],
    mutationFn: async (query: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const entryByPhrase = Object.values(INITIAL_RESPONSES).find(r => r.phrase === query);
      const entryByLabel = INITIAL_RESPONSES[query];
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
