import { getIdentity } from "@/lib/corpus/site";
import { pageMetadata } from "@/lib/site-url";

// The page is a Client Component and cannot export metadata; this layout
// exists only to give /chat its own title and share preview.
export function generateMetadata() {
  const { name } = getIdentity();
  return pageMetadata({
    title: "Ask about his work",
    description: `Ask anything about ${name}'s work. Every answer comes from his recorded projects and results — nothing invented.`,
    path: "/chat",
    owner: name,
  });
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
