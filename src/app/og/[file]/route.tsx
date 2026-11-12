import { isLocale, LOCALES } from "@/i18n/routing";
import { renderShareCard } from "@/lib/og/share-card";

/**
 * The share image per language, `/og/pt.png` and `/og/en.png` (ADR-0015).
 * Rendered once at build: nothing here reads the request. The `.png` keeps the
 * proxy from treating it as a page (`routePath` lets files through).
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ file: `${locale}.png` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = file.replace(/\.png$/, "");
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  return renderShareCard(locale);
}
