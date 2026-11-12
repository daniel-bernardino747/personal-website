import { getDictionary } from "@/i18n/dictionary";
import { isLocale } from "@/i18n/routing";
import { getIdentity } from "@/lib/corpus/site";
import { pageMetadata } from "@/lib/site-url";

// The page is a Client Component and cannot export metadata; this layout
// exists only to give /chat its own title and share preview.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: param } = await params;
  const locale = isLocale(param) ? param : "pt";
  const t = getDictionary(locale);
  const { name } = getIdentity();
  return pageMetadata({
    title: t.chat.metaTitle,
    description: t.chat.metaDescription(name),
    path: "/chat",
    owner: name,
    imageAlt: t.meta.imageAlt(name),
    locale,
  });
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
