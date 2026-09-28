import 'server-only';

import type { Identity } from './schema';
import { type Corpus, CorpusError, readCorpus, siteJsonPath } from './source';

/**
 * The site's façade over `site:json` (ADR-0013). Reads happen at build time in
 * Server Components, and at runtime only in the chat route; the `server-only`
 * import keeps this out of client bundles. Client components receive Corpus
 * data as props or through a provider seeded here.
 */
export function getCorpus(): Corpus {
  return readCorpus();
}

/**
 * The Identity the site renders its header from. The site cannot render without
 * one, so its absence halts the build rather than shipping a header with no
 * name (spec story 34, 35).
 */
export function getIdentity(): Identity {
  const { identity } = readCorpus();
  if (!identity) {
    throw new CorpusError(
      `The site requires an Identity, but ${siteJsonPath()} carries none. Does the career checkout have corpus/identity.md?`,
    );
  }
  return identity;
}
