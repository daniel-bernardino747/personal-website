import 'server-only';

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  type Accomplishment,
  type Affiliation,
  type Identity,
  type Kind,
  SITE_JSON_VERSION,
  siteJsonSchema,
} from './schema.ts';

/**
 * The Corpus as this site sees it: the `site:json` slice the `career` repository
 * publishes (ADR-0013), never the markdown. `scripts/fetch-corpus.mjs` writes it
 * to `.corpus/site.json` before `next dev` and `next build`. The deployed image
 * points `SITE_JSON` at the Featured slice `bake-corpus` put beside the server.
 */
export interface Corpus {
  /** The site header and résumé header. Undefined only if `career` has none. */
  identity?: Identity;
  affiliations: Affiliation[];
  /** Records: published Accomplishments with a Metric. */
  accomplishments: Accomplishment[];
  /** Published Accomplishments with no Metric: only projects reach the site as drafts. */
  drafts: Accomplishment[];
  /** Records marked Featured, which are also the agent's whole scope (ADR-0008). */
  featured: Accomplishment[];
  byKind(kind: Kind, options?: QueryOptions): Accomplishment[];
  byAffiliation(affiliationId: string, options?: QueryOptions): Accomplishment[];
}

/** Options accepted by the Corpus's filtering queries. */
export interface QueryOptions {
  /**
   * Include Accomplishments that carry no Metric. Off by default, so a claim is
   * never made from an unmeasured result. The project gallery opts in, because a
   * shipped project whose numbers are not recovered yet is still a real project.
   */
  includeDrafts?: boolean;
}

/** Thrown when `site.json` is missing, from another contract version, or malformed. */
export class CorpusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorpusError';
  }
}

export function siteJsonPath(): string {
  return process.env.SITE_JSON ?? join(process.cwd(), '.corpus', 'site.json');
}

export function readCorpus(path: string = siteJsonPath()): Corpus {
  if (!existsSync(path)) {
    throw new CorpusError(
      `No site.json at ${path}. Run \`npm run corpus:fetch\`, which reads it from the career checkout (CORPUS_REPO, default ../career).`,
    );
  }
  return fromSiteJson(JSON.parse(readFileSync(path, 'utf8')));
}

export function fromSiteJson(input: unknown): Corpus {
  const version = (input as { version?: unknown } | null)?.version;
  if (version !== SITE_JSON_VERSION) {
    throw new CorpusError(
      `site.json is version ${String(version)}; this site understands ${SITE_JSON_VERSION}. Update the reader and the producer together.`,
    );
  }

  const parsed = siteJsonSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new CorpusError(`site.json does not match the contract: ${issues}`);
  }

  const { identity, affiliations } = parsed.data;
  const affiliationsById = new Map(affiliations.map((a) => [a.id, a]));

  const all: Accomplishment[] = parsed.data.accomplishments.map((a) => {
    const affiliation = a.affiliationId ? affiliationsById.get(a.affiliationId) : undefined;
    if (a.affiliationId && !affiliation) {
      throw new CorpusError(
        `site.json: Accomplishment "${a.id}" references Affiliation "${a.affiliationId}", which it does not carry.`,
      );
    }
    return { ...a, affiliation };
  });

  const records = all.filter((a) => !a.isDraft);
  const pool = (options?: QueryOptions) => (options?.includeDrafts ? all : records);

  return {
    identity: identity ?? undefined,
    affiliations,
    accomplishments: records,
    drafts: all.filter((a) => a.isDraft),
    featured: records.filter((a) => a.featured),
    byKind: (kind, options) => pool(options).filter((a) => a.kind === kind),
    byAffiliation: (affiliationId, options) =>
      pool(options).filter((a) => a.affiliationId === affiliationId),
  };
}
