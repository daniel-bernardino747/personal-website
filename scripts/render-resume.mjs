// Render a Selection JSON to a résumé PDF via Tectonic.
//
// Usage:
//   node scripts/render-resume.mjs <selection.json> [--outdir <dir>] [--name <name>] [--skip-source-check]
//   npm run render -- generated/selections/acme-backend.json
//
// Generation itself is an agent session governed by the `generate` skill — the
// model reads the Corpus and writes the Selection JSON. This script is the one
// deterministic, mechanical step: it takes that Selection and produces the PDF
// through the versioned template, so the model never touches LaTeX (ADR-0004).
//
// Output defaults to `generated/resumes/`, which is gitignored and outside the
// static export, so a résumé naming a target employer is never published or
// committed (spec stories 24, 25).

import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import { RenderError, renderSelectionToPdf } from '../src/lib/render/resume.ts';

const DEFAULT_OUTDIR = join('generated', 'resumes');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { outDir: DEFAULT_OUTDIR, name: undefined, skipSourceCheck: false };
  let selectionPath;

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
    } else if (selectionPath === undefined) {
      selectionPath = arg;
    } else {
      fail(`Unexpected argument: ${arg}`);
    }
  }

  if (selectionPath === undefined) {
    fail(
      'Usage: node scripts/render-resume.mjs <selection.json> [--outdir <dir>] [--name <name>] [--skip-source-check]',
    );
  }
  return { selectionPath, ...args };
}

/** Every Accomplishment id currently in the Corpus (filenames without `.md`). */
function knownSourceIds() {
  try {
    return new Set(
      readdirSync(join(process.cwd(), 'content', 'accomplishments'))
        .filter((entry) => entry.endsWith('.md'))
        .map((entry) => entry.slice(0, -'.md'.length)),
    );
  } catch {
    return new Set();
  }
}

/**
 * Fail loudly if the Selection cites a source that no longer exists in the Corpus
 * (spec story 23): a stale Selection must not silently drop content. Defensive
 * reads only — a structurally broken Selection is left for the schema to reject
 * with a precise message inside `renderSelectionToPdf`.
 */
function checkSources(selection) {
  const cited = [];
  for (const section of selection?.sections ?? []) {
    for (const entry of section?.entries ?? []) {
      if (typeof entry?.source === 'string') cited.push(entry.source);
    }
  }

  const known = knownSourceIds();
  const missing = [...new Set(cited)].filter((source) => !known.has(source));
  if (missing.length > 0) {
    fail(
      `Selection cites source(s) with no matching content/accomplishments/*.md: ${missing.join(', ')}.\n` +
        'Fix the Selection or capture the Accomplishment first. ' +
        'Pass --skip-source-check to render anyway (e.g. for a fixture).',
    );
  }
}

function main() {
  const { selectionPath, outDir, name, skipSourceCheck } = parseArgs(
    process.argv.slice(2),
  );

  let selection;
  try {
    selection = JSON.parse(readFileSync(selectionPath, 'utf8'));
  } catch (error) {
    fail(`Could not read Selection at ${selectionPath}: ${error.message}`);
  }

  if (!skipSourceCheck) checkSources(selection);

  const resumeName = name ?? basename(selectionPath).replace(/\.json$/i, '');

  try {
    const { pdfPath, texPath } = renderSelectionToPdf(selection, {
      outDir,
      name: resumeName,
    });
    process.stdout.write(`Rendered ${pdfPath}\n(source ${texPath})\n`);
  } catch (error) {
    if (error instanceof RenderError) fail(error.message);
    throw error;
  }
}

main();
