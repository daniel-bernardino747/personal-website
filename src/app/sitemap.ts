import type { MetadataRoute } from "next";

import { localeAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import { LOCALES } from "@/i18n/routing";

// /guestbook is left out on purpose: its form cannot succeed (issue 06 of
// agent-answers-from-the-corpus), and a search result should not land there.
const PATHS = ["/", "/achievements", "/chat"];

/** Every page in both languages, each listing its other-language version (ADR-0015). */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (path: string) => new URL(path, SITE_URL).toString();
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => {
      const { canonical, languages } = localeAlternates(path, locale);
      return {
        url: absolute(canonical),
        alternates: {
          languages: Object.fromEntries(Object.entries(languages).map(([lang, href]) => [lang, absolute(href)])),
        },
      };
    }),
  );
}
