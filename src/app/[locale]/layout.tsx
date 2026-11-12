import { Footer } from "@/components/layout/Footer";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { IdentityProvider } from "@/components/IdentityProvider";
import { MouseTracker } from "@/components/layout/MouseTracker";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransitionLayout } from "@/components/layout/PageTransitionLayout";
import { buildChatAnswers } from "@/lib/chat/answers";
import { getCorpus, getIdentity } from "@/lib/corpus/site";
import { SITE_URL } from "@/lib/site-url";
import { localeAlternates, shareImage } from "@/lib/seo";
import { oferta } from "@/content/oferta/pt";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/dictionary";
import { HTML_LANG, isLocale, LOCALES, OG_LOCALE, type Locale } from "@/i18n/routing";
import localFont from "next/font/local";
import "../globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import { ChatAnswersProvider } from "@/components/ChatAnswersProvider";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

/**
 * The share preview is drawn from the Identity, like everything else: title,
 * description and the image (`/og/<locale>.png`) all change with a Corpus edit
 * in `career`. In Portuguese the home speaks to a business in Criciúma
 * (ADR-0015), so its title and description name the city and the services.
 * Pages set their own canonical, hreflang and share fields through `pageMetadata`.
 */
type LocaleParams = { params: Promise<{ locale: string }> };

// Only the two languages exist; any other first segment is a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale: param } = await params;
  const locale: Locale = isLocale(param) ? param : "pt";
  const identity = getIdentity(locale);
  const pt = locale === "pt";
  const title = `${identity.name} — ${pt ? oferta.seo.title : identity.role[0]}`;
  const description = pt ? oferta.seo.description : identity.bio;
  const image = shareImage(locale, getDictionary(locale).meta.imageAlt(identity.name));
  const alternates = localeAlternates("/", locale);

  return {
    metadataBase: SITE_URL,
    title: { default: title, template: `%s — ${identity.name}` },
    description,
    alternates,
    openGraph: {
      type: "website",
      siteName: identity.name,
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    icons: {
      icon: "/images/avatar.png",
      apple: "/images/avatar.png",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
}> & LocaleParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const identity = getIdentity(locale);
  const chatAnswers = buildChatAnswers(getCorpus(locale), locale);
  const t = getDictionary(locale);

  return (
    <html lang={HTML_LANG[locale]} suppressHydrationWarning className={cn(geistSans.variable, geistMono.variable, "font-sans", geist.variable)}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <DictionaryProvider locale={locale}>
              <IdentityProvider identity={identity}>
                <ChatAnswersProvider answers={chatAnswers}>
                  <MouseTracker />
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {t.skipLink}
                  </a>
                  <Navbar />
                  <main id="main-content">
                    <PageTransitionLayout>
                      {children}
                    </PageTransitionLayout>
                  </main>
                  <Footer />
                </ChatAnswersProvider>
              </IdentityProvider>
            </DictionaryProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
