import { join, resolve } from 'node:path';

/**
 * Where the `career` checkout is (ADR-0013): `CORPUS_REPO`, or the sibling
 * directory `../career`. `scripts/fetch-corpus.mjs` runs its contracts there.
 * The render scripts still read its file list until ticket 04 of
 * `.scratch/corpus-leaves` moves them into `career`.
 *
 * Plain TypeScript with no imports beyond `node:path`, so the scripts can import
 * it directly.
 */
export function careerRepo(): string {
  return resolve(process.env.CORPUS_REPO ?? join(process.cwd(), '..', 'career'));
}

export function corpusDir(): string {
  return join(careerRepo(), 'corpus');
}

/** Where `generate` and `cover-letter` write their output. */
export function generatedDir(): string {
  return join(careerRepo(), 'generated');
}
