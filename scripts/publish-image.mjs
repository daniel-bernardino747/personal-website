// Publishes the packed artefact as the production image (the site moved from
// Railway to a Coolify VPS in Oct 2026; see migracao-coolify/CHECKLIST.md 2.5).
//
// Coolify cannot build this site: the build needs the `career` checkout, which
// only exists on this machine (ADR-0013). So the image is built here from
// `deploy.tar` (the Dockerfile is a single ADD) and pushed to GHCR under a dated
// tag and `latest`. Coolify runs `latest`; a redeploy there picks it up.
//
// Needs Docker running and `docker login ghcr.io` (a token with write:packages).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const IMAGE = 'ghcr.io/daniel-bernardino747/personal-website';

if (!existsSync('deploy.tar')) {
  console.error('publish-image: no deploy.tar. Run `npm run build` first (never `next build` alone, ADR-0008).');
  process.exit(1);
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const tag = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

const run = (args) => execFileSync('docker', args, { stdio: 'inherit' });
run(['build', '-t', `${IMAGE}:${tag}`, '-t', `${IMAGE}:latest`, '.']);
run(['push', `${IMAGE}:${tag}`]);
run(['push', `${IMAGE}:latest`]);

console.log(`\npublish-image: ${IMAGE}:${tag} (also latest) pushed. Redeploy the resource in Coolify to go live.`);
