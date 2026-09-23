import { existsSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

/** One slide of the Mindset card — a photo or a looping, muted clip. */
export interface MindsetSlide {
  /** Public URL, e.g. `/mindset/01-deadlift.mp4`. */
  src: string;
  kind: 'image' | 'video';
}

const KINDS: Record<string, MindsetSlide['kind']> = {
  '.webp': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.avif': 'image',
  '.mp4': 'video',
  '.webm': 'video',
};

/**
 * Everything in `public/mindset/`, in filename order. Read when the page renders
 * at build time, so adding a slide is dropping a file there (usually via
 * `npm run mindset`) and rebuilding — no code change. A missing folder is an
 * empty slideshow, not an error.
 */
export function listMindsetSlides(
  dir = join(process.cwd(), 'public', 'mindset'),
): MindsetSlide[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .sort()
    .flatMap((file) => {
      const kind = KINDS[extname(file).toLowerCase()];
      return kind ? [{ src: `/mindset/${encodeURIComponent(file)}`, kind }] : [];
    });
}
