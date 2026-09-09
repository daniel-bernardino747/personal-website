'use client';

import { ChatHeader } from "@/components/chat/ChatHeader";
import dynamic from 'next/dynamic';

const ChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer').then(mod => mod.ChatContainer),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatHeader />
      <ChatContainer />
    </div>
  );
}
