import type { Metadata } from 'next';

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
}: {
  title: string;
  description: string;
  path: string;
  /** Appended to the share title, which has no template to add it. */
  owner: string;
}): Metadata {
  const shareTitle = `${title} — ${owner}`;
  const image = { url: '/opengraph-image', width: 1200, height: 630, alt: `${owner} — portfolio` };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: owner,
      title: shareTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: [image] },
  };
}
