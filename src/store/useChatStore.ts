import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
  timestamp: number;
}

export interface ChatAction {
  label: string;
  phrase: string;
  color: string;
}

interface ChatState {
  messages: Message[];
  initialQuery: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setInitialQuery: (query: string | null) => void;
  clearHistory: () => void;
}



export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      initialQuery: null,
      addMessage: (msg) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...msg,
            id: Date.now(),
            timestamp: Date.now(),
          },
        ],
      })),
      setInitialQuery: (query) => set({ initialQuery: query }),
      clearHistory: () => set({ messages: [] }),
    }),


    {
      name: 'portfolio-chat-history',
    }
  )
);
