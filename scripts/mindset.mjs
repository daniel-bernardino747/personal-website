// Turns the raw training photos, clips and GIFs in `media/mindset/` into the loops the
// Mindset card plays, written to `public/mindset/`.
//
// Why not real GIFs: a phone clip as a GIF runs to several megabytes and caps at
// 256 colours. A muted, looping H.264 MP4 plays exactly like a GIF on the page at
// a tenth of the size, so videos become that. Photos become WebP.
//
// Every clip is cut to its first CLIP_SECONDS so it plays whole during its slide
// — the card advances on the same interval. Trim the moment you want before
// dropping a video in, or it opens on whatever the phone caught first.
//
// Re-running is cheap: a file whose output is newer than its source is skipped.
// Order on the site is filename order, so prefix with 01-, 02-… to arrange it.
//
// Requires ffmpeg on PATH (`winget install Gyan.FFmpeg`).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

// Kept in step with SLIDE_MS in BentoMindset.tsx.
const CLIP_SECONDS = 2.5;
const WIDTH = 720;

// No .heic: ffmpeg can't read iPhone HEIC — export those as JPG first.
const IMAGE = new Set(['.jpg', '.jpeg', '.png', '.webp']);
// A GIF is a clip, not a photo: it gets the same MP4 loop treatment.
const VIDEO = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.gif']);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inbox = join(root, 'media', 'mindset');
const out = join(root, 'public', 'mindset');

mkdirSync(inbox, { recursive: true });
mkdirSync(out, { recursive: true });

function isFresh(source, target) {
  return existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs;
}

function ffmpeg(args) {
  return execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
    stdio: 'inherit',
  });
}

// Never upscale; keep the height even, as H.264 requires.
const scale = `scale='min(${WIDTH},iw)':-2`;

let converted = 0;
let skipped = 0;
let failed = 0;

for (const file of readdirSync(inbox).sort()) {
  const ext = extname(file).toLowerCase();
  const source = join(inbox, file);
  const { name } = parse(file);

  let target;
  let args;
  if (IMAGE.has(ext)) {
    target = join(out, `${name}.webp`);
    args = ['-i', source, '-vf', scale, '-frames:v', '1', '-quality', '80', target];
  } else if (VIDEO.has(ext)) {
    target = join(out, `${name}.mp4`);
    args = [
      '-i', source,
      '-t', String(CLIP_SECONDS),
      '-an',
      '-vf', `${scale},fps=30`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      target,
    ];
  } else {
    continue;
  }

  if (isFresh(source, target)) { skipped++; continue; }

  // One unreadable file shouldn't cost the rest of the batch.
  try {
    ffmpeg(args);
    converted++;
    console.log(`✓ ${file}`);
  } catch {
    failed++;
    console.error(`✗ ${file} — ffmpeg could not convert it`);
  }
}

console.log(
  `\n${converted} converted, ${skipped} already up to date, ${failed} failed → public/mindset/`,
);
if (failed) process.exitCode = 1;
