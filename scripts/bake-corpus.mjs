// Copies the Featured slice of the Corpus into the standalone artefact.
//
// Why this exists: `/api/chat` builds its system prompt on the first request, and
// `loadCorpus()` reads `content/` from disk. That directory is gitignored and
// excluded from the image, and the loader treats a missing directory as a
// legitimate empty state — so without this step the agent would deploy knowing
// nothing at all, silently, with no error anywhere.
//
// It copies files rather than serialising records, so there is no second reader
// of the Corpus to keep in sync with `src/lib/corpus/loader.ts`. What lands in
// the artefact is exactly what ADR-0008 permits: the Featured Accomplishments,
// the Affiliations they reference, and the Identity. The other 21 records never
// leave this machine.
//
// Guarded by `src/lib/agent/baked-corpus.test.ts`.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'content');
const target = join(root, '.next', 'standalone', 'content');

function read(dir) {
  try {
    return readdirSync(join(source, dir))
      .filter((name) => name.endsWith('.md'))
      .map((name) => ({
        name,
        id: name.slice(0, -3),
        ...matter(readFileSync(join(source, dir, name), 'utf8')),
      }));
  } catch {
    return [];
  }
}

const accomplishments = read('accomplishments');
const featured = accomplishments.filter((file) => file.data.featured === true);

if (featured.length === 0) {
  console.error(
    'bake-corpus: no Featured Accomplishments found. The agent would ship with an\n' +
      'empty record, so the build is stopped here rather than deploying a chat that\n' +
      'knows nothing. Check content/accomplishments/ for `featured: true`.',
  );
  process.exit(1);
}

// Only the Affiliations the Featured records point at. A dangling reference is a
// load error, so this set is not optional.
const needed = new Set(
  featured.map((file) => file.data.affiliation).filter(Boolean),
);

rmSync(target, { recursive: true, force: true });
mkdirSync(join(target, 'accomplishments'), { recursive: true });
mkdirSync(join(target, 'affiliations'), { recursive: true });

for (const file of featured) {
  copyFileSync(
    join(source, 'accomplishments', file.name),
    join(target, 'accomplishments', file.name),
  );
}

let affiliations = 0;
for (const file of read('affiliations')) {
  if (!needed.has(file.id)) continue;
  copyFileSync(
    join(source, 'affiliations', file.name),
    join(target, 'affiliations', file.name),
  );
  affiliations += 1;
}

copyFileSync(join(source, 'identity.md'), join(target, 'identity.md'));

const withheld = accomplishments.length - featured.length;
console.log(
  `bake-corpus: ${featured.length} featured, ${affiliations} affiliations, identity. ` +
    `${withheld} non-featured record${withheld === 1 ? '' : 's'} withheld.`,
);
