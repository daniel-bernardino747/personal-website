// Packs the build artefact into a single `deploy.tar` for upload.
//
// Why a tarball instead of uploading the directory: `railway up` filters the
// upload through `.railwayignore` *combined with* `.gitignore`, and this tree has
// names inside the artefact that collide with things which must stay out —
// `content`, `node_modules`, `src`. Two deploys failed to that: first
// `"/.next/static": not found`, then a container dying on `Cannot find module
// 'next'` because `.next/standalone/node_modules` never arrived. Re-anchoring the
// patterns fixed the first and not the second.
//
// A tarball ends the argument. It is one file, so no ignore rule can reach
// inside it, and what the builder receives is exactly what was packed here.
//
// The layout matches the container's `/app` exactly, so the Dockerfile is a
// single ADD:
//
//   ./            <- .next/standalone (server.js, node_modules, content/)
//   ./.next/static
//   ./public

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.deploy-staging');
const tarball = join(root, 'deploy.tar');

const standalone = join(root, '.next', 'standalone');
if (!existsSync(standalone)) {
  console.error('pack-deploy: .next/standalone is missing. Run `next build` first.');
  process.exit(1);
}

// The guarantee this whole pipeline exists to keep (ADR-0002, ADR-0007): only the
// Featured slice travels.
//
// This is a real check, not a trust in ordering, because `next build` on its own
// copies the *entire* Corpus here — its file tracer sees the loader reading
// `content/` and takes the directory with it. Measured: 26 records after
// `npx next build`, 5 after `npm run build`. `bake-corpus.mjs` deletes and
// rebuilds the directory, so the pipeline is correct, but only while it runs in
// the right order. Anyone running `next build && railway up` by hand would ship
// all 26 and nothing downstream would notice.
//
// So the last step before upload counts them itself.
const baked = join(standalone, 'content');
if (!existsSync(baked)) {
  console.error(
    'pack-deploy: .next/standalone/content is missing — bake-corpus did not run.\n' +
      'The agent would deploy with an empty record. Run `npm run build`.',
  );
  process.exit(1);
}

const bakedRecords = readdirSync(join(baked, 'accomplishments')).filter((name) =>
  name.endsWith('.md'),
);
const leaked = bakedRecords.filter((name) => {
  const { data } = matter(
    readFileSync(join(baked, 'accomplishments', name), 'utf8'),
  );
  return data.featured !== true;
});

if (leaked.length > 0) {
  console.error(
    `pack-deploy: ${leaked.length} non-Featured Accomplishment(s) are in the\n` +
      'artefact and would be uploaded:\n' +
      leaked.map((name) => `  ${name}`).join('\n') +
      '\n\nThis is what ADR-0008 exists to prevent. `next build` copies the whole\n' +
      'Corpus on its own; `scripts/bake-corpus.mjs` is what reduces it to the\n' +
      'Featured set. Run `npm run build`, which does both, rather than\n' +
      '`next build` directly.',
  );
  process.exit(1);
}

rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

cpSync(standalone, staging, { recursive: true });
cpSync(join(root, '.next', 'static'), join(staging, '.next', 'static'), {
  recursive: true,
});
cpSync(join(root, 'public'), join(staging, 'public'), { recursive: true });

rmSync(tarball, { force: true });

// `tar` resolves differently depending on which shell npm hands this to: Git
// Bash has GNU tar on the PATH, a plain Windows shell finds bsdtar in System32.
// Both can create this archive, but a failure in either used to surface only as
// `status: 128` with no message, because stderr went to an inherited stream that
// npm had already swallowed. Capture it and say what happened.
// Paths are relative, with `cwd` doing the work, because GNU tar reads an
// absolute Windows path as a remote location: `C:\...` parses as `host:path` and
// it tries to open a network connection, failing with
// `tar: Cannot connect to C: resolve failed`. bsdtar does not have that reading,
// so relative paths are the form that works under both.
try {
  execFileSync('tar', ['-cf', 'deploy.tar', '-C', '.deploy-staging', '.'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (error) {
  const stderr = error.stderr?.toString().trim();
  console.error(
    `pack-deploy: tar failed (exit ${error.status}).` +
      (stderr ? `\n${stderr}` : '\nNo output — check that `tar` is on the PATH.'),
  );
  process.exit(1);
}

rmSync(staging, { recursive: true, force: true });

const mb = (statSync(tarball).size / 1024 / 1024).toFixed(1);
console.log(`pack-deploy: deploy.tar (${mb} MB) ready.`);
