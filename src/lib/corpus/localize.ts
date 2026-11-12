import type { Locale } from '@/i18n/routing';

import type { SiteJson } from './schema';
import { parseStatement } from './statement';

/**
 * The Corpus in the page's language (ADR-0015). `career` translates what it
 * publishes and ships only current translations in `translations.<locale>.texts`,
 * so each field is either its reviewed Portuguese or, if missing or stale, the
 * English, field by field. Nothing is translated here; this only picks.
 *
 * A statement is translated as its prose. The "Built with …", "Live:" and
 * "Repo:" tail stays in English and is re-attached, so the stack chips and the
 * links still come from the original (`parseStatement` reads them back).
 */
export function localizeSiteJson(site: SiteJson, locale: Locale): SiteJson {
  if (locale === 'en') return site;
  const texts = site.translations[locale]?.texts ?? {};
  const pick = (key: string, english: string) => texts[key] ?? english;
  const pickOptional = (key: string, english: string | undefined) =>
    english === undefined ? undefined : pick(key, english);

  const identity = site.identity && {
    ...site.identity,
    role: site.identity.role.map((role, i) => pick(`identity.role.${i}`, role)),
    location: pick('identity.location', site.identity.location),
    headline: pickOptional('identity.headline', site.identity.headline),
    bio: pick('identity.bio', site.identity.bio),
    availability: site.identity.availability && {
      engagement: site.identity.availability.engagement.map((e, i) =>
        pick(`identity.availability.engagement.${i}`, e),
      ),
      workMode: pick('identity.availability.workMode', site.identity.availability.workMode),
      hours: pick('identity.availability.hours', site.identity.availability.hours),
    },
    services: site.identity.services?.map((s, i) => pick(`identity.services.${i}`, s)),
    serviceArea: pickOptional('identity.serviceArea', site.identity.serviceArea),
  };

  const affiliations = site.affiliations.map((a) => ({
    ...a,
    organisation: pick(`affiliation:${a.id}.organisation`, a.organisation),
    role: pick(`affiliation:${a.id}.role`, a.role),
  }));

  const accomplishments = site.accomplishments.map((a) => {
    const key = (field: string) => `accomplishment:${a.id}.${field}`;
    return {
      ...a,
      title: pickOptional(key('title'), a.title),
      metric: pickOptional(key('metric'), a.metric),
      image: a.image && { ...a.image, alt: pick(key('imageAlt'), a.image.alt) },
      statement: withProse(a.statement, texts[key('prose')]),
    };
  });

  return { ...site, identity, affiliations, accomplishments };
}

/** The statement with its prose replaced and its English marker tail kept. */
function withProse(statement: string, prose: string | undefined): string {
  if (prose === undefined) return statement;
  const trimmed = statement.trim();
  const english = parseStatement(trimmed).prose;
  const tail = trimmed.slice(english.length).trim();
  return tail === '' ? prose : `${prose} ${tail}`;
}
