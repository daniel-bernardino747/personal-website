// Print the Corpus as JSON on stdout — the read contract `prospect-me` consumes
// (ADR-0011). Every record with a Metric, drafts excluded, Featured or not.
//
// Usage:
//   npm run --silent corpus:json > corpus.json
//
// Private and local: never run this from a build or a deploy.
// `--conditions=react-server` (set in package.json) lets the loader's
// `server-only` guard resolve to its no-op outside Next.

import { toCorpusJson } from '../src/lib/corpus/export.ts';
import { loadCorpus } from '../src/lib/corpus/loader.ts';

process.stdout.write(`${JSON.stringify(toCorpusJson(loadCorpus()), null, 2)}\n`);
