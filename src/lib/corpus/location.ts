import { join, resolve } from 'node:path';

/**
 * Where the `career` checkout is (ADR-0013): `CORPUS_REPO`, or the sibling
 * directory `../career`. `scripts/fetch-corpus.mjs` and `project:image` run its
 * contracts there; nothing here reads its files.
 *
 * Plain TypeScript with no imports beyond `node:path`, so the scripts can import
 * it directly.
 */
export function careerRepo(): string {
  return resolve(process.env.CORPUS_REPO ?? join(process.cwd(), '..', 'career'));
}
