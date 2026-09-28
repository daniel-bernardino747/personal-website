// Writes the Featured slice of `site:json` into the standalone artefact.
//
// Why this exists: `/api/chat` builds its system prompt on the first request,
// reading `SITE_JSON`, which the Dockerfile points at `corpus/site.json` beside
// the server. Without this step the agent would deploy knowing nothing.
//
// `.corpus/site.json` is already only what the site publishes (ADR-0013), but the
// agent's scope is narrower still (ADR-0008): the Featured records, the
// Affiliations they reference, and the Identity. The pages are prerendered HTML
// and need no data at runtime, so the gallery's other projects stay out of the
// image too. Anything `next build` traced on its own (`.corpus/`, a stray
// `content/`) is deleted here, so this file is the only record data that ships.
//
// Guarded by `src/lib/agent/baked-corpus.test.ts` and checked again by
// `pack-deploy`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '.corpus', 'site.json');
const standalone = join(root, '.next', 'standalone');
const target = join(standalone, 'corpus', 'site.json');

const site = JSON.parse(readFileSync(source, 'utf8'));
const featured = site.accomplishments.filter((a) => a.featured === true && a.isDraft === false);

if (featured.length === 0) {
  console.error(
    'bake-corpus: no Featured records in .corpus/site.json. The agent would ship\n' +
      'with an empty record, so the build is stopped here rather than deploying a\n' +
      'chat that knows nothing. Check `featured: true` in career/corpus/accomplishments/.',
  );
  process.exit(1);
}

const needed = new Set(featured.map((a) => a.affiliationId).filter(Boolean));

for (const traced of ['.corpus', 'content', 'corpus']) {
  rmSync(join(standalone, traced), { recursive: true, force: true });
}
mkdirSync(dirname(target), { recursive: true });
writeFileSync(
  target,
  `${JSON.stringify(
    {
      version: site.version,
      identity: site.identity,
      affiliations: site.affiliations.filter((a) => needed.has(a.id)),
      accomplishments: featured,
    },
    null,
    2,
  )}\n`,
);

const withheld = site.accomplishments.length - featured.length;
console.log(
  `bake-corpus: ${featured.length} featured, ${needed.size} affiliations, identity. ` +
    `${withheld} other published record${withheld === 1 ? '' : 's'} left to the prerendered pages.`,
);
