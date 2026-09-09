import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';

/**
 * Guards `scripts/bake-corpus.mjs` — the step that decides which records leave
 * this machine.
 *
 * The failure it exists to catch is silent in both directions: bake too little
 * and the agent deploys knowing nothing (the loader reads a missing directory as
 * a legitimate empty state, so nothing errors); bake too much and Accomplishments
 * Daniel chose not to publish ship inside the image, within reach of anyone who
 * asks the right question. Neither shows up in a build log.
 *
 * Skipped when there is no artefact — `npm test` runs on a clean checkout too.
 */
const BAKED = join(process.cwd(), '.next', 'standalone', 'content');
const SOURCE = join(process.cwd(), 'content');

function accomplishments(dir: string) {
  const path = join(dir, 'accomplishments');
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      id: name.slice(0, -3),
      data: matter(readFileSync(join(path, name), 'utf8')).data,
    }));
}

describe.skipIf(!existsSync(BAKED))('the baked Corpus', () => {
  it('carries only Featured Accomplishments', () => {
    const baked = accomplishments(BAKED);

    expect(baked.length).toBeGreaterThan(0);
    for (const record of baked) {
      expect(record.data.featured, `${record.id} is not featured`).toBe(true);
    }
  });

  it('carries every Featured Accomplishment', () => {
    const expected = accomplishments(SOURCE)
      .filter((record) => record.data.featured === true)
      .map((record) => record.id)
      .sort();
    const actual = accomplishments(BAKED)
      .map((record) => record.id)
      .sort();

    expect(actual).toEqual(expected);
  });

  it('withholds the non-Featured records', () => {
    const source = accomplishments(SOURCE);
    const withheld = source.filter((record) => record.data.featured !== true);
    const bakedIds = new Set(accomplishments(BAKED).map((record) => record.id));

    // The point of the whole exercise: these exist locally and must not travel.
    expect(withheld.length).toBeGreaterThan(0);
    for (const record of withheld) {
      expect(bakedIds.has(record.id), `${record.id} leaked into the artefact`).toBe(
        false,
      );
    }
  });

  it('carries the Identity and every referenced Affiliation', () => {
    expect(existsSync(join(BAKED, 'identity.md'))).toBe(true);

    const referenced = new Set(
      accomplishments(BAKED)
        .map((record) => record.data.affiliation)
        .filter(Boolean) as string[],
    );

    for (const id of referenced) {
      // A dangling Affiliation reference is a load error, so a missing one here
      // would take the agent down on its first request.
      expect(
        existsSync(join(BAKED, 'affiliations', `${id}.md`)),
        `affiliation ${id} is referenced but was not baked`,
      ).toBe(true);
    }
  });
});
