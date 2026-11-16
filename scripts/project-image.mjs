// Acquire the image a project card shows (ADR-0012), in order: the live site's
// og:image, a headless-Chrome screenshot of the live site, or a file Daniel
// supplies. Writes the cover to `public/projects/<id>/cover.webp` at exactly
// 1200×630 (ADR-0017) and prints the frontmatter to add — it never edits the
// Corpus. Daniel looks at the image and writes its alt before it is recorded.
//
// With `--screen <name>`, it adds an extra screen for the project dialog instead
// (ADR-0017): `public/projects/<id>/<name>.webp`, from a file Daniel supplies,
// stored at 1200×630 or, for a phone screen, fitted without cropping into a
// transparent 630×1200.
//
// Usage:
//   npm run project:image -- <accomplishment-id>
//   npm run project:image -- <accomplishment-id> --screenshot    (skip og:image)
//   npm run project:image -- <accomplishment-id> --file <path>   (a supplied image)
//   npm run project:image -- <accomplishment-id> --screen <name> --file <path>
//   npm run project:image -- <accomplishment-id> --screen <name> --file <clip.mp4|.mov|.webm>
//     (a short video screen, ADR-0018: needs ffmpeg and ffprobe on the PATH)
//   ... --force   (replace a file that already exists)
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

import { runCareer } from './career.mjs';

import { fromSiteJson } from '../src/lib/corpus/source.ts';
import { parseStatement } from '../src/lib/corpus/statement.ts';
import {
  COVER,
  fitsRatio,
  findOgImage,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
  imageSrc,
  isVideoFile,
  SCREEN_NAME,
  screenFit,
  VIDEO_CRF,
  VIDEO_MAX_BYTES,
  videoFit,
} from '../src/lib/projects/image.ts';

const OUT_DIR = join('public', 'projects');
const USER_AGENT =
  'Mozilla/5.0 (compatible; project-image/1.0; +https://www.teamdbsolutions.com)';

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { id: undefined, file: undefined, screenshot: false, screen: undefined, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--file') args.file = argv[++i];
    else if (arg === '--screenshot') args.screenshot = true;
    else if (arg === '--screen') args.screen = argv[++i];
    else if (arg === '--force') args.force = true;
    else if (!arg.startsWith('--') && args.id === undefined) args.id = arg;
    else fail(`Unknown argument: ${arg}`);
  }
  if (!args.id) {
    fail(
      'Usage: npm run project:image -- <accomplishment-id> [--screenshot | --file <path>]\n' +
        '       npm run project:image -- <accomplishment-id> --screen <name> --file <path>\n' +
        '       add --force to replace a file that already exists',
    );
  }
  if (args.screen !== undefined) {
    if (!SCREEN_NAME.test(args.screen)) fail(`Screen name "${args.screen}" must be letters, digits, _ or - only.`);
    if (args.screen === COVER) fail(`"${COVER}" is the cover; run without --screen to acquire it.`);
    if (!args.file) fail('An extra screen comes from a file Daniel supplies: pass --file <path>.');
    if (args.screenshot) fail('--screenshot acquires the cover; it does not combine with --screen.');
  }
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
  const { id, file, screenshot: forceScreenshot, screen, force } = parseArgs(process.argv.slice(2));

  // Read fresh from `career`, not from `.corpus/`: capture runs this right after
  // writing the record, before any fetch.
  const corpus = fromSiteJson(JSON.parse(runCareer('site:json')));
  const accomplishment = [...corpus.accomplishments, ...corpus.drafts].find(
    (a) => a.id === id,
  );
  if (!accomplishment) {
    fail(
      `"${id}" is not in site:json. Only projects and Featured records reach the site, ` +
        'so only they carry an image. Check career/corpus/accomplishments/.',
    );
  }

  if (screen !== undefined) return addScreen(accomplishment, screen, file, force);

  if (file && isVideoFile(file)) {
    fail('The cover is what the gallery card shows, so it is always a picture. A clip can be a later screen: add --screen <name>.');
  }

  const coverOut = join(OUT_DIR, id, `${COVER}.webp`);
  if (existsSync(coverOut) && !force) {
    fail(`${coverOut} already exists. Pass --force to replace it (and approve the new one again).`);
  }

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

  mkdirSync(join(OUT_DIR, id), { recursive: true });
  const out = coverOut;
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
      `career/corpus/accomplishments/${id}.md:`,
      '',
      'images:',
      `  - src: ${imageSrc(id)}`,
      '    alt: "<what the image shows, in words>"',
      '',
    ].join('\n'),
  );
}

/** Adds an extra screen for the project dialog (ADR-0017). */
async function addScreen(accomplishment, name, file, force) {
  const { id } = accomplishment;
  if (!accomplishment.images?.length) {
    fail(`"${id}" has no cover recorded yet. The first image is the cover: acquire and record it first.`);
  }
  if (isVideoFile(file)) return addVideoScreen(accomplishment, name, file, force);

  const src = imageSrc(id, name);
  if (accomplishment.images.some((image) => image.src === src)) {
    process.stderr.write(`  ${src} is already recorded; this replaces the file only.\n`);
  }
  const out = join(OUT_DIR, id, `${name}.webp`);
  if (existsSync(out) && !force) fail(`${out} already exists. Pass --force to replace it.`);

  const buffer = readFileSync(file);
  const { width, height } = await sharp(buffer).metadata();
  const target = screenFit(width ?? 0, height ?? 0);
  if (!target) {
    fail(
      `The file ${file} is ${width}×${height}: neither close to 1200×630 nor a phone portrait (9:21 to 9:16).\n` +
        'Refused rather than cropped.',
    );
  }

  mkdirSync(join(OUT_DIR, id), { recursive: true });
  await sharp(buffer)
    .resize(target.width, target.height, {
      fit: target.fit,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 })
    .toFile(out);

  const kb = Math.round(readFileSync(out).length / 1024);
  process.stdout.write(
    [
      `Wrote ${out} (${target.width}×${target.height}, ${kb} KB) from ${file}.`,
      '',
      'Look at it. If it shows the project, append to `images:` in the frontmatter of',
      `career/corpus/accomplishments/${id}.md, in the order the carousel should show it:`,
      '',
      `  - src: ${src}`,
      '    alt: "<what the screen shows, in words>"',
      '',
      `Then translate its alt under accomplishment:${id}.imageAlt:${name}.`,
      '',
    ].join('\n'),
  );
}

/** `ffprobe`'s view of a clip: its displayed size (rotation applied) and duration. */
function probe(file) {
  let raw;
  try {
    raw = execFileSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation:format=duration', '-of', 'json', file],
      { encoding: 'utf8' },
    );
  } catch {
    fail('ffprobe could not read the clip. Is ffmpeg installed and on the PATH?');
  }
  const json = JSON.parse(raw);
  const stream = json.streams?.[0];
  if (!stream) fail(`${file} has no video stream.`);
  const rotation = Math.abs(Number(stream.side_data_list?.find((d) => 'rotation' in d)?.rotation ?? 0));
  const turned = rotation === 90 || rotation === 270;
  return {
    width: turned ? stream.height : stream.width,
    height: turned ? stream.width : stream.height,
    seconds: Number(json.format?.duration ?? 0),
  };
}

/**
 * Adds a video screen (ADR-0018): an H.264 MP4 with no audio and `faststart`, and
 * beside it the WebP poster of the same name, from the clip's first frame. Over
 * the size budget it tries once more at a lower quality, then refuses and leaves
 * nothing behind.
 */
async function addVideoScreen(accomplishment, name, file, force) {
  const { id } = accomplishment;
  const src = imageSrc(id, name).replace(/\.webp$/, '.mp4');
  const out = join(OUT_DIR, id, `${name}.mp4`);
  const poster = join(OUT_DIR, id, `${name}.webp`);
  for (const path of [out, poster]) {
    if (existsSync(path) && !force) fail(`${path} already exists. Pass --force to replace it.`);
  }

  const { width, height, seconds } = probe(file);
  const fit = videoFit(width, height, seconds);
  if ('refused' in fit) fail(`The clip ${file} is refused: ${fit.refused}. Nothing is cropped or trimmed.`);

  mkdirSync(join(OUT_DIR, id), { recursive: true });
  let bytes = 0;
  for (const crf of VIDEO_CRF) {
    execFileSync(
      'ffmpeg',
      ['-y', '-v', 'error', '-i', file, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-vf', `scale=${fit.width}:${fit.height},setsar=1`, out],
      { stdio: 'inherit' },
    );
    bytes = readFileSync(out).length;
    if (bytes <= VIDEO_MAX_BYTES) break;
    process.stderr.write(`  ${Math.round(bytes / 1024)} KB at quality ${crf} is over budget; trying lower.\n`);
  }
  if (bytes > VIDEO_MAX_BYTES) {
    rmSync(out, { force: true });
    fail(
      `Even at the lowest quality the clip is ${Math.round(bytes / 1024)} KB, over ${VIDEO_MAX_BYTES / 1024} KB.\n` +
        'Shorten it, or record it at a smaller size, and try again.',
    );
  }

  // The first frame, through a PNG so `sharp` writes the WebP like every other picture.
  const dir = mkdtempSync(join(tmpdir(), 'project-video-'));
  try {
    const frame = join(dir, 'frame.png');
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', out, '-frames:v', '1', frame], { stdio: 'inherit' });
    await sharp(readFileSync(frame)).webp({ quality: 80 }).toFile(poster);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  process.stdout.write(
    [
      `Wrote ${out} (${fit.width}×${fit.height}, ${seconds.toFixed(1)} s, ${Math.round(bytes / 1024)} KB) and its poster ${poster}.`,
      '',
      'Watch it. If it shows the project, append to `images:` in the frontmatter of',
      `career/corpus/accomplishments/${id}.md, in the order the carousel should show it:`,
      '',
      `  - src: ${src}`,
      '    alt: "<what the clip shows, in words>"',
      '',
      `Then translate its alt under accomplishment:${id}.imageAlt:${name}.`,
      '',
    ].join('\n'),
  );
}

await main();
