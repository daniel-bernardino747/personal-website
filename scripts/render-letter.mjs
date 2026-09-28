// Render a Letter JSON to a cover-letter PDF via Tectonic.
//
// Usage:
//   node scripts/render-letter.mjs <letter.json> [--outdir <dir>] [--name <name>] [--skip-source-check]
//   npm run render:letter -- generated/letters/acme-backend.json
//
// The résumé's sibling (see scripts/render-resume.mjs): the `cover-letter` skill
// writes the Letter JSON, and this script is the one mechanical step that turns it
// into a PDF through the fixed template (ADR-0004). Output defaults to
// `generated/letters/`, gitignored and outside the static export.

import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { corpusDir, generatedDir } from '../src/lib/corpus/location.ts';

import { RenderError } from '../src/lib/render/document.ts';
import { LETTER_NON_CORPUS_SOURCES, renderLetterToPdf } from '../src/lib/render/letter.ts';

const DEFAULT_OUTDIR = join(generatedDir(), 'letters');
const USAGE =
  'Usage: node scripts/render-letter.mjs <letter.json> [--outdir <dir>] [--name <name>] [--skip-source-check]';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { outDir: DEFAULT_OUTDIR, name: undefined, skipSourceCheck: false };
  let letterPath;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--outdir') {
      args.outDir = argv[(i += 1)];
    } else if (arg === '--name') {
      args.name = argv[(i += 1)];
    } else if (arg === '--skip-source-check') {
      args.skipSourceCheck = true;
    } else if (arg.startsWith('--')) {
      fail(`Unknown flag: ${arg}`);
    } else if (letterPath === undefined) {
      letterPath = arg;
    } else {
      fail(`Unexpected argument: ${arg}`);
    }
  }

  if (letterPath === undefined) fail(USAGE);
  return { letterPath, ...args };
}

/** Every Accomplishment id currently in the Corpus (filenames without `.md`). */
function knownSourceIds() {
  try {
    return new Set(
      readdirSync(join(corpusDir(), 'accomplishments'))
        .filter((entry) => entry.endsWith('.md'))
        .map((entry) => entry.slice(0, -'.md'.length)),
    );
  } catch {
    return new Set();
  }
}

/**
 * Fail loudly if a paragraph cites something that is neither a reserved source
 * (`posting`, `identity`, `daniel`) nor an Accomplishment in the Corpus.
 * Defensive reads only — a structurally broken Letter is left for the schema.
 */
function checkSources(letter) {
  const cited = (letter?.paragraphs ?? []).flatMap((paragraph) =>
    Array.isArray(paragraph?.sources) ? paragraph.sources : [],
  );

  const known = knownSourceIds();
  const reserved = new Set(LETTER_NON_CORPUS_SOURCES);
  const missing = [...new Set(cited)].filter(
    (source) => !reserved.has(source) && !known.has(source),
  );
  if (missing.length > 0) {
    fail(
      `Letter cites source(s) that are neither ${[...reserved].join('/')} nor a content/accomplishments/*.md: ${missing.join(', ')}.\n` +
        'Fix the Letter or capture the Accomplishment first. ' +
        'Pass --skip-source-check to render anyway (e.g. for a fixture).',
    );
  }
}

function main() {
  const { letterPath, outDir, name, skipSourceCheck } = parseArgs(process.argv.slice(2));

  let letter;
  try {
    letter = JSON.parse(readFileSync(letterPath, 'utf8'));
  } catch (error) {
    fail(`Could not read Letter at ${letterPath}: ${error.message}`);
  }

  if (!skipSourceCheck) checkSources(letter);

  try {
    const { pdfPath, texPath } = renderLetterToPdf(letter, {
      outDir,
      name: name ?? basename(letterPath).replace(/\.json$/i, ''),
    });
    process.stdout.write(`Rendered ${pdfPath}\n(source ${texPath})\n`);
  } catch (error) {
    if (error instanceof RenderError) fail(error.message);
    throw error;
  }
}

main();
