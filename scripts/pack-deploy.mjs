// Packs the build artefact into a single `deploy.tar` for upload.
//
// Why a tarball instead of uploading the directory: `railway up` filters the
// upload through `.railwayignore` *combined with* `.gitignore`, and this tree has
// names inside the artefact that collide with things which must stay out —
// `corpus`, `node_modules`, `src`. Two deploys failed to that: first
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
//   ./            <- .next/standalone (server.js, node_modules, corpus/site.json)
//   ./.next/static
//   ./public

import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';


const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const staging = join(root, '.deploy-staging');
const tarball = join(root, 'deploy.tar');

const standalone = join(root, '.next', 'standalone');
if (!existsSync(standalone)) {
  console.error('pack-deploy: .next/standalone is missing. Run `next build` first.');
  process.exit(1);
}

// The guarantee this whole pipeline exists to keep (ADR-0008, ADR-0013): only the
// Featured slice travels, as `corpus/site.json`, and no other record data does.
//
// This is a real check, not a trust in ordering. `next build` on its own traces
// whatever the server reads into the standalone tree, and `bake-corpus.mjs` is
// what reduces it. Anyone running `next build && railway up` by hand would skip
// that, and nothing downstream would notice. So the last step before upload
// looks for itself.
const baked = join(standalone, 'corpus', 'site.json');
if (!existsSync(baked)) {
  console.error(
    'pack-deploy: .next/standalone/corpus/site.json is missing — bake-corpus did not run.\n' +
      'The agent would deploy with an empty record. Run `npm run build`.',
  );
  process.exit(1);
}

const stray = ['.corpus', 'content'].filter((name) => existsSync(join(standalone, name)));
const leaked = JSON.parse(readFileSync(baked, 'utf8')).accomplishments.filter(
  (a) => a.featured !== true,
);

if (stray.length > 0 || leaked.length > 0) {
  console.error(
    'pack-deploy: the artefact carries record data beyond the Featured slice:\n' +
      [
        ...stray.map((name) => `  .next/standalone/${name}/`),
        ...leaked.map((a) => `  ${a.id} (not Featured)`),
      ].join('\n') +
      '\n\nThis is what ADR-0008 exists to prevent. Run `npm run build`, which\n' +
      'bakes the slice, rather than `next build` directly.',
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
