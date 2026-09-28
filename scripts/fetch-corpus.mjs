// Fetches what this site publishes from the `career` checkout (ADR-0013) into
// `.corpus/`, before `next dev`, `next build` and the tests:
//
//   .corpus/site.json    the `site:json` contract, version-checked
//   .corpus/resume.pdf   the complete résumé (ADR-0009), rendered by `career`
//
//   node scripts/fetch-corpus.mjs [--json-only]
//
// `--json-only` skips the résumé, which needs Tectonic and takes seconds; the
// tests use it. The checkout is `CORPUS_REPO`, or the sibling `../career`.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { careerRepo } from '../src/lib/corpus/location.ts';
import { runCareer } from './career.mjs';

const SITE_JSON_VERSION = 1; // src/lib/corpus/schema.ts checks it again on read

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '.corpus');
const repo = careerRepo();

if (!existsSync(join(repo, 'package.json'))) {
  console.error(
    `fetch-corpus: no career checkout at ${repo}.\n` +
      'Clone it there, or set CORPUS_REPO to where it is (ADR-0013).',
  );
  process.exit(1);
}

mkdirSync(out, { recursive: true });

const json = runCareer('site:json');
const { version } = JSON.parse(json);
if (version !== SITE_JSON_VERSION) {
  console.error(
    `fetch-corpus: career emits site:json version ${version}; this site reads ${SITE_JSON_VERSION}.`,
  );
  process.exit(1);
}
writeFileSync(join(out, 'site.json'), json);

if (!process.argv.includes('--json-only')) {
  runCareer('resume:pdf', ['--out-dir', out]);
}

console.log(`fetch-corpus: .corpus/ written from ${repo}.`);
