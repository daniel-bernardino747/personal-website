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
  /**
   * Appends a streamed chunk to one specific message.
   *
   * Addressed by id rather than "the last one" on purpose. Two overlapping
   * streams — a quick action clicked on the home page, then another on `/chat`
   * before the first finished — each open their own bubble, and "last" moves
   * when the second opens. Writing to the last message then shuffles both
   * answers into one bubble, word by word.
   */
  appendToMessage: (id: number, chunk: string) => void;
  setInitialQuery: (query: string | null) => void;
  clearHistory: () => void;
}



export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      initialQuery: null,
      addMessage: (msg) => set((state) => {
        // `Date.now()` alone collides when two bubbles open in the same
        // millisecond, and a collision puts two streams back into one bubble by
        // another route. The counter only has to be unique within a session.
        const now = Date.now();
        const previous = state.messages[state.messages.length - 1]?.id ?? 0;
        const id = now > previous ? now : previous + 1;

        return {
          messages: [...state.messages, { ...msg, id, timestamp: now }],
        };
      }),
      appendToMessage: (id, chunk) => set((state) => {
        const index = state.messages.findIndex((message) => message.id === id);
        // The message can legitimately be gone — history cleared mid-stream.
        // Dropping the chunk is correct; recreating it would resurrect a
        // conversation the visitor just deleted.
        if (index === -1) return state;

        const target = state.messages[index];
        const messages = [...state.messages];
        messages[index] = { ...target, text: target.text + chunk };
        return { messages };
      }),
      setInitialQuery: (query) => set({ initialQuery: query }),
      clearHistory: () => set({ messages: [] }),
    }),


    {
      name: 'portfolio-chat-history',
    }
  )
);
