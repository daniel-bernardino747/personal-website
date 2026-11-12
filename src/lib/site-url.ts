import type { Metadata } from 'next';

import { OG_LOCALE, LOCALES, type Locale } from '@/i18n/routing';

import { localeAlternates, shareImage } from './seo';

/**
 * The canonical origin every absolute URL is built from — share previews,
 * canonical links, the sitemap. Crawlers and link unfurlers (LinkedIn, WhatsApp,
 * X, Slack) ignore relative image URLs, so the origin has to be known at build.
 *
 * `SITE_URL` overrides it for a preview deploy; the default is the one domain
 * the site is served on, with www, since the apex redirects there.
 */
export const SITE_URL = new URL(
  process.env.SITE_URL ?? 'https://www.teamdbsolutions.com',
);

/**
 * Metadata for a page below the root. Next merges metadata one key deep, so a
 * page that set only `title` would inherit the root's canonical and its share
 * title — a link to /achievements unfurling as the home page. Every page states
 * all three — and the image too, because a page's `openGraph` replaces the
 * root's whole, dropping the image `opengraph-image.tsx` put there.
 */
export function pageMetadata({
  title,
  description,
  path,
  owner,
  imageAlt,
  locale,
}: {
  title: string;
  description: string;
  path: string;
  /** Appended to the share title, which has no template to add it. */
  owner: string;
  /** The share image's alt text, in the page's language. */
  imageAlt: string;
  /** The page's language: its canonical, hreflang alternates and share image (ADR-0015). */
  locale: Locale;
}): Metadata {
  const shareTitle = `${title} — ${owner}`;
  const image = shareImage(locale, imageAlt);
  const alternates = localeAlternates(path, locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      siteName: owner,
      title: shareTitle,
      description,
      url: alternates.canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: [image] },
  };
}
