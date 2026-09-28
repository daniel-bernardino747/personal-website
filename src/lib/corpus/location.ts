import { join, resolve } from 'node:path';

/**
 * Where the Corpus lives (ADR-0013). It left this repository for the private
 * `career` checkout, which every reader finds by path, the way `prospect-me`
 * already does.
 *
 * - `CORPUS_DIR` names the Corpus directory outright. The deployed image sets it
 *   to the Featured slice `bake-corpus` put beside the server, since no
 *   checkout travels with the image.
 * - Otherwise it is `corpus/` inside `CORPUS_REPO`, which defaults to the sibling
 *   directory `../career`.
 *
 * Plain TypeScript with no imports beyond `node:path`, so the build scripts can
 * import it directly.
 */
export function careerRepo(): string {
  return resolve(process.env.CORPUS_REPO ?? join(process.cwd(), '..', 'career'));
}

export function corpusDir(): string {
  const explicit = process.env.CORPUS_DIR;
  return explicit ? resolve(explicit) : join(careerRepo(), 'corpus');
}

/** Where `generate`, `cover-letter` and the review sheet write their output. */
export function generatedDir(): string {
  return join(careerRepo(), 'generated');
}
