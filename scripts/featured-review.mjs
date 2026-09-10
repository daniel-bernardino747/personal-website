// Generates a review sheet for the Featured set (issue 04), and reads it back.
//
//   node scripts/featured-review.mjs          -> writes generated/featured-review.md
//   node scripts/featured-review.mjs --apply  -> applies the decisions to content/
//
// The sheet lands in `generated/` because it carries the metrics of the 21
// records that are deliberately unpublished, and this repository is public.
// `generated/` is gitignored for exactly this reason.

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'content', 'accomplishments');
const sheet = join(root, 'generated', 'featured-review.md');

function load() {
  return readdirSync(dir)
    .filter((n) => n.endsWith('.md'))
    .map((name) => {
      const parsed = matter(readFileSync(join(dir, name), 'utf8'));
      return {
        id: name.slice(0, -3),
        name,
        data: parsed.data,
        body: parsed.content.trim(),
      };
    })
    .sort((a, b) => String(b.data.date).localeCompare(String(a.data.date)));
}

function affiliationName(id) {
  if (!id) return '—';
  try {
    const f = matter(
      readFileSync(join(root, 'content', 'affiliations', `${id}.md`), 'utf8'),
    );
    return f.data.organisation ?? id;
  } catch {
    return id;
  }
}

function entry(record, index) {
  const { data, body, id } = record;
  // An Accomplishment may legitimately have neither a `title` nor an
  // Affiliation — a talk, a personal project. Falling through to the id keeps
  // every block identifiable; the earlier version printed a bare "—", which
  // made two records impossible to tell apart in the sheet.
  const title = data.title ?? (data.affiliation ? affiliationName(data.affiliation) : id);
  const metric = data.metric ? `\`${data.metric}\`` : '_(draft — no metric)_';

  return [
    `### ${index}. ${title}`,
    '',
    `- **id:** \`${id}\``,
    `- **when:** ${data.date} · **kind:** ${data.kind} · **at:** ${affiliationName(data.affiliation)}`,
    `- **metric:** ${metric}`,
    '',
    '> ' + body.replace(/\n+/g, '\n> '),
    '',
    '**FEATURED:** ',
    '',
    '---',
    '',
  ].join('\n');
}

if (process.argv.includes('--apply')) {
  const text = readFileSync(sheet, 'utf8');
  const decisions = new Map();

  // Each block carries its id, then its answer further down.
  for (const block of text.split(/^### /m).slice(1)) {
    const id = block.match(/\*\*id:\*\* `([^`]+)`/)?.[1];
    const answer = block.match(/\*\*FEATURED:\*\*\s*([A-Za-z]*)/)?.[1]?.trim().toUpperCase();
    if (!id || !answer) continue;
    if (answer.startsWith('Y')) decisions.set(id, true);
    else if (answer.startsWith('N')) decisions.set(id, false);
  }

  if (decisions.size === 0) {
    console.error('featured-review: no Y/N answers found. Nothing applied.');
    process.exit(1);
  }

  let changed = 0;
  const unanswered = [];

  for (const record of load()) {
    const wanted = decisions.get(record.id);
    if (wanted === undefined) {
      unanswered.push(record.id);
      continue;
    }
    const current = record.data.featured === true;
    if (current === wanted) continue;

    const path = join(dir, record.name);
    const raw = readFileSync(path, 'utf8');
    const updated = /^featured:\s*(true|false)\s*$/m.test(raw)
      ? raw.replace(/^featured:\s*(true|false)\s*$/m, `featured: ${wanted}`)
      : raw.replace(/^---\n/, `---\nfeatured: ${wanted}\n`);

    writeFileSync(path, updated);
    console.log(`  ${current ? 'un-featured' : 'featured'}: ${record.id}`);
    changed += 1;
  }

  const featured = load().filter((r) => r.data.featured === true);
  console.log(`\nfeatured-review: ${changed} change(s). ${featured.length} now featured.`);
  if (unanswered.length) {
    console.log(`left alone (no answer): ${unanswered.length}`);
  }
  if (featured.length === 0) {
    console.error('\nWARNING: nothing is featured. The agent would know nothing.');
  }
} else {
  const all = load();
  const current = all.filter((r) => r.data.featured === true);
  const rest = all.filter((r) => r.data.featured !== true);

  const out = [
    '# Featured review — issue 04',
    '',
    'Write **Y** or **N** after `**FEATURED:**` in each block, then tell Claude.',
    'Leave one blank to keep it exactly as it is.',
    '',
    '**Y** means: the agent will state this to any visitor who asks, metric and',
    'client named, and it appears on `/achievements`.',
    '**N** means: the agent has never heard of it. It stays in the Corpus and stays',
    'available to `generate` for résumés — this removes it from the public channel',
    'only, and is reversible.',
    '',
    '> This file is in `generated/` because it lists the metrics of records you',
    '> chose not to publish, and the repository is public. It is gitignored.',
    '',
    `## Currently featured — ${current.length}`,
    '',
    ...current.map((r, i) => entry(r, i + 1)),
    `## Not featured — ${rest.length}`,
    '',
    'Newest first. Promote one if the set above ends up thin.',
    '',
    ...rest.map((r, i) => entry(r, current.length + i + 1)),
  ].join('\n');

  mkdirSync(dirname(sheet), { recursive: true });
  writeFileSync(sheet, out);
  console.log(`featured-review: ${sheet}`);
  console.log(`  ${current.length} featured, ${rest.length} not.`);
}
