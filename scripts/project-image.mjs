// Acquire the image a project card shows (ADR-0012), in order: the live site's
// og:image, a headless-Chrome screenshot of the live site, or a file Daniel
// supplies. Writes `public/projects/<id>.webp` at exactly 1200×630 and prints the
// frontmatter to add — it never edits the Corpus. Daniel looks at the image and
// writes its alt before `image:` is recorded.
//
// Usage:
//   npm run project:image -- <accomplishment-id>
//   npm run project:image -- <accomplishment-id> --screenshot    (skip og:image)
//   npm run project:image -- <accomplishment-id> --file <path>   (a supplied image)
//
// Local and deliberate, like capture itself: never run this from a build. The
// build reads only what is already in `public/projects/`.
// `--conditions=react-server` (set in package.json) lets the loader's
// `server-only` guard resolve to its no-op outside Next.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import sharp from 'sharp';

import { loadCorpus } from '../src/lib/corpus/loader.ts';
import { parseStatement } from '../src/lib/corpus/statement.ts';
import {
  fitsRatio,
  findOgImage,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  imageSrc,
} from '../src/lib/projects/image.ts';

const OUT_DIR = join('public', 'projects');
const USER_AGENT =
  'Mozilla/5.0 (compatible; project-image/1.0; +https://www.teamdbsolutions.com)';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { id: undefined, file: undefined, screenshot: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--file') args.file = argv[++i];
    else if (arg === '--screenshot') args.screenshot = true;
    else if (!arg.startsWith('--') && args.id === undefined) args.id = arg;
    else fail(`Unknown argument: ${arg}`);
  }
  if (!args.id) fail('Usage: npm run project:image -- <accomplishment-id> [--screenshot | --file <path>]');
  return args;
}

/** Chrome or Edge, wherever this machine keeps it. `CHROME_PATH` wins. */
function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  return candidates.find((path) => path && existsSync(path));
}

async function fetchOgImage(liveUrl) {
  const page = await fetch(liveUrl, { headers: { 'user-agent': USER_AGENT } });
  if (!page.ok) {
    process.stderr.write(`  ${liveUrl} answered ${page.status}; no og:image read.\n`);
    return undefined;
  }
  const imageUrl = findOgImage(await page.text(), page.url);
  if (!imageUrl) return undefined;

  const image = await fetch(imageUrl, { headers: { 'user-agent': USER_AGENT } });
  if (!image.ok) {
    process.stderr.write(`  og:image ${imageUrl} answered ${image.status}.\n`);
    return undefined;
  }
  return { buffer: Buffer.from(await image.arrayBuffer()), origin: `og:image ${imageUrl}` };
}

function screenshot(liveUrl) {
  const browser = findBrowser();
  if (!browser) fail('No Chrome or Edge found for the screenshot; set CHROME_PATH.');
  const dir = mkdtempSync(join(tmpdir(), 'project-image-'));
  const path = join(dir, 'shot.png');
  try {
    execFileSync(
      browser,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--user-data-dir=${join(dir, 'profile')}`,
        `--window-size=${IMAGE_WIDTH},${IMAGE_HEIGHT}`,
        // Lets a client-rendered page run its scripts before the shot is taken.
        '--virtual-time-budget=8000',
        `--screenshot=${path}`,
        liveUrl,
      ],
      { stdio: 'ignore', timeout: 60_000 },
    );
    return { buffer: readFileSync(path), origin: `screenshot of ${liveUrl}` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const { id, file, screenshot: forceScreenshot } = parseArgs(process.argv.slice(2));

  const corpus = loadCorpus();
  const accomplishment = [...corpus.accomplishments, ...corpus.drafts].find(
    (a) => a.id === id,
  );
  if (!accomplishment) fail(`No Accomplishment "${id}" in content/accomplishments/.`);

  let acquired;
  if (file) {
    acquired = { buffer: readFileSync(file), origin: `file ${file}` };
  } else {
    const { liveUrl } = parseStatement(accomplishment.statement);
    if (!liveUrl) {
      fail(
        `"${id}" records no Live: URL, so there is nothing to fetch or photograph.\n` +
          'Supply an image with --file <path> (1200×630, or close to 1.91:1), or leave the card without one.',
      );
    }
    if (!forceScreenshot) {
      acquired = await fetchOgImage(liveUrl);
      if (!acquired) process.stderr.write(`  No og:image for ${liveUrl}; taking a screenshot.\n`);
    }
    acquired ??= screenshot(liveUrl);
  }

  const { width, height } = await sharp(acquired.buffer).metadata();
  if (!fitsRatio(width ?? 0, height ?? 0)) {
    fail(
      `The ${acquired.origin} is ${width}×${height}, not close to 1.91:1 — refused rather than cropped.\n` +
        'Compose it onto a 1200×630 canvas first (a portrait phone screenshot especially), then pass it with --file.',
    );
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, `${id}.webp`);
  await sharp(acquired.buffer)
    .resize(IMAGE_WIDTH, IMAGE_HEIGHT, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(out);

  const kb = Math.round(readFileSync(out).length / 1024);
  process.stdout.write(
    [
      `Wrote ${out} (${kb} KB) from the ${acquired.origin}.`,
      '',
      'Look at it. If it shows the project, add to the frontmatter of',
      `content/accomplishments/${id}.md:`,
      '',
      'image:',
      `  src: ${imageSrc(id)}`,
      '  alt: "<what the image shows, in words>"',
      '',
    ].join('\n'),
  );
}

await main();
