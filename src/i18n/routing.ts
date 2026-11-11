/**
 * Portuguese lives at the root and English under `/en`, with the same paths
 * (ADR-0015). Internally every page sits under `app/[locale]`, so the proxy
 * rewrites `/x` to `/pt/x`. `/pt/x` is never a public URL: it redirects to `/x`,
 * so each page has exactly one address per language. Nothing here reads
 * `Accept-Language`: a URL always serves one language.
 */
export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt';

/** The `lang` attribute and the Open Graph locale of each language. */
export const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export type Routing =
  | { kind: 'next' }
  | { kind: 'rewrite'; pathname: string }
  | { kind: 'redirect'; pathname: string };

function hasPrefix(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname.startsWith(`/${locale}/`);
}

/** What the proxy does with a public path. */
export function routePath(pathname: string): Routing {
  // A file (`/resume.pdf`, `/robots.txt`, `/images/x.png`) has one address.
  if (/\.[^/]+$/.test(pathname)) return { kind: 'next' };
  if (hasPrefix(pathname, 'en')) return { kind: 'next' };
  if (hasPrefix(pathname, DEFAULT_LOCALE)) {
    return { kind: 'redirect', pathname: pathname.slice(DEFAULT_LOCALE.length + 1) || '/' };
  }
  return { kind: 'rewrite', pathname: `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}` };
}

/**
 * The path without its language, whichever form it arrives in: the public one
 * (`/chat`, `/en/chat`) or the internal one (`/pt/chat`).
 */
export function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (hasPrefix(pathname, locale)) return pathname.slice(locale.length + 1) || '/';
  }
  return pathname;
}

/**
 * The public URL of a site path in a language. `href` is written as Portuguese
 * would be (`/`, `/#about`, `/chat`), and English gains the `/en` prefix.
 */
export function localeHref(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith('/')) return href;
  if (href === '/') return '/en';
  if (href.startsWith('/#')) return `/en${href.slice(1)}`;
  return `/en${href}`;
}
