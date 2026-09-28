import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { fromSiteJson } from '../corpus/source';

/**
 * Guards `scripts/bake-corpus.mjs` — the step that decides which records leave
 * this machine inside the deployed image.
 *
 * The failure it exists to catch is silent in both directions: bake too little
 * and the agent deploys knowing nothing; bake too much and records beyond the
 * Featured set ship inside the image, within reach of anyone who asks the right
 * question (ADR-0008). Neither shows up in a build log.
 *
 * Skipped when there is no artefact — `npm test` runs before any build too.
 */
const STANDALONE = join(process.cwd(), '.next', 'standalone');
const BAKED = join(STANDALONE, 'corpus', 'site.json');
const SOURCE = join(process.cwd(), '.corpus', 'site.json');

type Record = { id: string; featured: boolean; isDraft: boolean; affiliationId?: string };
const read = (path: string) =>
  JSON.parse(readFileSync(path, 'utf8')) as {
    identity: unknown;
    affiliations: { id: string }[];
    accomplishments: Record[];
  };

describe.skipIf(!existsSync(BAKED) || !existsSync(SOURCE))('the baked Corpus', () => {
  it('is a valid site:json the agent can read', () => {
    expect(() => fromSiteJson(JSON.parse(readFileSync(BAKED, 'utf8')))).not.toThrow();
  });

  it('carries every Featured record and nothing else', () => {
    const expected = read(SOURCE)
      .accomplishments.filter((a) => a.featured && !a.isDraft)
      .map((a) => a.id)
      .sort();
    const actual = read(BAKED).accomplishments.map((a) => a.id).sort();

    expect(actual.length).toBeGreaterThan(0);
    expect(actual).toEqual(expected);
  });

  it('carries the Identity and only the Affiliations its records reference', () => {
    const baked = read(BAKED);
    const referenced = new Set(baked.accomplishments.map((a) => a.affiliationId).filter(Boolean));

    expect(baked.identity).toBeTruthy();
    expect(baked.affiliations.map((a) => a.id).sort()).toEqual([...referenced].sort());
  });

  it('leaves no traced copy of the Corpus beside the server', () => {
    for (const stray of ['.corpus', 'content']) {
      expect(existsSync(join(STANDALONE, stray)), `${stray}/ travelled`).toBe(false);
    }
  });
});
