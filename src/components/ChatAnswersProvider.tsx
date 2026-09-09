"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ChatAnswer } from "@/lib/chat/types";

/**
 * Carries the Corpus-derived chat answers to Client Components, the same way
 * `IdentityProvider` carries the Identity: the loader is `server-only`, so a
 * Server Component (the root layout) builds the answers at build time and seeds
 * them here.
 *
 * It is seeded in the layout rather than in `/chat` because the home page's
 * `AIInput` offers the same questions, and `chat/page.tsx` is itself a Client
 * Component — it needs `dynamic(…, { ssr: false })` for the persisted store.
 */
const ChatAnswersContext = createContext<ChatAnswer[] | null>(null);

export function ChatAnswersProvider({
  answers,
  children,
}: {
  answers: ChatAnswer[];
  children: ReactNode;
}) {
  return (
    <ChatAnswersContext.Provider value={answers}>
      {children}
    </ChatAnswersContext.Provider>
  );
}

export function useChatAnswers(): ChatAnswer[] {
  const answers = useContext(ChatAnswersContext);
  if (!answers) {
    throw new Error("useChatAnswers must be used within a ChatAnswersProvider");
  }
  return answers;
}
