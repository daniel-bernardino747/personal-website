import { Footer } from "@/components/layout/Footer";
import { IdentityProvider } from "@/components/IdentityProvider";
import { MouseTracker } from "@/components/layout/MouseTracker";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransitionLayout } from "@/components/layout/PageTransitionLayout";
import { buildChatAnswers } from "@/lib/chat/answers";
import { getCorpus, getIdentity } from "@/lib/corpus/site";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "@/components/Providers";
import { ChatAnswersProvider } from "@/components/ChatAnswersProvider";


const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export function generateMetadata(): Metadata {
  const identity = getIdentity();
  return {
    title: `${identity.name} — ${identity.role[0]}`,
    description: identity.bio,
    icons: {
      icon: "/images/avatar.png",
      apple: "/images/avatar.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const identity = getIdentity();
  const chatAnswers = buildChatAnswers(getCorpus());

  return (
    <html lang="en" suppressHydrationWarning className={cn(geistSans.variable, geistMono.variable, "font-sans", geist.variable)}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <IdentityProvider identity={identity}>
              <ChatAnswersProvider answers={chatAnswers}>
                <MouseTracker />
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Skip to main content
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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
