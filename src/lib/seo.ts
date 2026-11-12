import { HTML_LANG, localeHref, LOCALES, type Locale } from '@/i18n/routing';

import type { Identity } from './corpus/schema';
import { SITE_URL } from './site-url';

/**
 * Where a page lives in each language (ADR-0015): its own canonical, every
 * language version as an hreflang alternate, and Portuguese as the x-default,
 * since the root is Portuguese. `path` is written as Portuguese is (`/chat`).
 */
export function localeAlternates(path: string, locale: Locale) {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[HTML_LANG[l]] = localeHref(l, path);
  languages['x-default'] = localeHref('pt', path);
  return { canonical: localeHref(locale, path), languages };
}

/** The share image drawn for each language, `/og/pt.png` or `/og/en.png`. */
export function shareImage(locale: Locale, alt: string) {
  return { url: `/og/${locale}.png`, width: 1200, height: 630, alt };
}

/**
 * Schema.org for the Portuguese home: a service-area business (Criciúma and the
 * region) with no street address, because the registered office is elsewhere
 * (ADR-0015), and Daniel as its founder. Built from the Identity only.
 */
export function localBusinessJsonLd(identity: Identity, description: string) {
  const url = SITE_URL.toString();
  const founder = {
    '@type': 'Person',
    name: identity.name,
    jobTitle: identity.role[0],
    image: new URL('/images/avatar.png', SITE_URL).toString(),
    sameAs: [identity.social.github, identity.social.linkedin],
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${url}#business`,
    name: identity.business?.name ?? identity.name,
    ...(identity.business && { legalName: identity.business.legalName, taxID: identity.business.cnpj }),
    description,
    url,
    image: new URL('/og/pt.png', SITE_URL).toString(),
    email: identity.social.email,
    ...(identity.social.whatsapp && { telephone: identity.social.whatsapp }),
    areaServed: [
      { '@type': 'City', name: 'Criciúma' },
      { '@type': 'AdministrativeArea', name: 'Santa Catarina' },
    ],
    ...(identity.services && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Serviços',
        itemListElement: identity.services.map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    }),
    founder,
    sameAs: [identity.social.github, identity.social.linkedin],
  };
}
