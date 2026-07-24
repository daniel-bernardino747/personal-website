import 'server-only';

import { type Corpus, CorpusError, loadCorpus } from './loader';
import type { Identity } from './schema';

/**
 * The site's façade over the loader. Reads happen at build time in Server
 * Components; the `server-only` import keeps this — and the loader behind it —
 * out of client bundles. Client components receive Corpus data as props or
 * through a provider seeded here.
 */
export function getCorpus(): Corpus {
  return loadCorpus();
}

/**
 * The Identity the site renders its header from. Unlike the loader — for which a
 * missing Identity is a legitimate empty state — the site cannot render without
 * one, so its absence halts the static export rather than shipping a header with
 * no name (spec story 34, 35).
 */
export function getIdentity(): Identity {
  const { identity } = loadCorpus();
  if (!identity) {
    throw new CorpusError(
      'The site requires content/identity.md, but no Identity was found in the Corpus.',
    );
  }
  return identity;
}
