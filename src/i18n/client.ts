'use client';

import { useParams, usePathname } from 'next/navigation';

import { DEFAULT_LOCALE, isLocale, localeHref, stripLocale, type Locale } from './routing';

/** The page's language, from the `[locale]` segment. */
export function useLocale(): Locale {
  const { locale } = useParams<{ locale?: string }>();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * The current path without its language (`/chat` on both `/chat` and
 * `/en/chat`), whether `usePathname` reports the public URL or the rewritten one.
 */
export function useSitePath(): string {
  return stripLocale(usePathname() ?? '/');
}

/** Builds public URLs in the page's language from paths written as `/x`. */
export function useLocaleHref(): (href: string) => string {
  const locale = useLocale();
  return (href) => localeHref(locale, href);
}
