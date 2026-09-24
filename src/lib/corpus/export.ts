import type { Corpus } from './loader.ts';

/**
 * The `corpus:json` contract (ADR-0011): what `prospect-me` reads from here, so
 * it never parses the markdown itself. Bump `version` on any breaking change —
 * the consumer lives in another repository.
 *
 * Records only: a draft carries no Metric, and nothing that reads this contract
 * may imply a result the Corpus cannot back. Not gated on Featured — the
 * consumer is private and local, and must never be run by a build or a deploy.
 */
export const CORPUS_JSON_VERSION = 1;

export function toCorpusJson(corpus: Corpus) {
  return {
    version: CORPUS_JSON_VERSION,
    identity: corpus.identity ?? null,
    affiliations: corpus.affiliations,
    accomplishments: corpus.accomplishments.map(
      ({ id, affiliationId, date, kind, metric, title, statement, featured }) => ({
        id,
        affiliationId: affiliationId ?? null,
        date,
        kind,
        metric: metric!,
        title: title ?? null,
        statement,
        featured,
      }),
    ),
  };
}

export type CorpusJson = ReturnType<typeof toCorpusJson>;
