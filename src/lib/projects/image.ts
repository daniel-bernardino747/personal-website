/**
 * The mechanical rules behind `npm run project:image` (ADR-0012), kept out of the
 * script so they can be tested without the network, Chrome or `sharp`.
 */

/** Every project image is stored at exactly this size — the Open Graph size. */
export const IMAGE_WIDTH = 1200;
export const IMAGE_HEIGHT = 630;

/**
 * How far an image's ratio may drift from 1200:630 and still be accepted (then
 * resized to the exact size, cropping at most a few pixels). Wider than that and
 * the crop would cut the picture; the image is refused instead of mangled.
 */
export const RATIO_TOLERANCE = 0.03;

/** The name of a project's first image, the cover its card shows (ADR-0017). */
export const COVER = 'cover';

/** The site path a project's image is recorded under, and served from. */
export function imageSrc(id: string, name: string = COVER): string {
  return `/projects/${id}/${name}.webp`;
}

/** The file name of an image or video without its extension: `cover` for `/projects/x/cover.webp`. */
export function imageName(src: string): string {
  return src.slice(src.lastIndexOf('/') + 1).replace(/\.(?:webp|mp4)$/, '');
}

/** True for a video screen (ADR-0018). */
export function isVideo(src: string): boolean {
  return src.endsWith('.mp4');
}

/**
 * A video screen's poster: the WebP of the same name beside it, which
 * `project:image` writes from the clip's first frame. A picture is its own poster.
 */
export function posterOf(src: string): string {
  return src.replace(/\.mp4$/, '.webp');
}

/** A portrait extra screen is stored at this size: one phone per image (ADR-0017). */
export const PORTRAIT_WIDTH = 630;
export const PORTRAIT_HEIGHT = 1200;

/**
 * The portraits accepted, from 9:21 to 9:16 — the span of phone screenshots, on
 * either side of 630:1200. A portrait screen is never cropped to size: it is
 * fitted inside the canvas and the rest is left transparent, which shows the
 * page's own background in either theme.
 */
export const PORTRAIT_MIN_RATIO = 9 / 21;
export const PORTRAIT_MAX_RATIO = 9 / 16;

/** The name a screen file may take: it becomes part of a site path and a translation key. */
export const SCREEN_NAME = /^[\w-]+$/;

export interface ScreenFit {
  width: number;
  height: number;
  /** `cover` trims at most a few pixels; `contain` trims nothing and pads. */
  fit: 'cover' | 'contain';
}

/**
 * How an extra screen of `width`×`height` is stored, or undefined when it is
 * refused: landscape close to 1200×630, or a portrait from 9:21 to 9:16.
 * Anything else — a square, a 16:9 desktop capture — is refused, never cropped.
 */
export function screenFit(width: number, height: number): ScreenFit | undefined {
  if (fitsRatio(width, height)) return { width: IMAGE_WIDTH, height: IMAGE_HEIGHT, fit: 'cover' };
  if (width <= 0 || height <= 0) return undefined;
  const ratio = width / height;
  if (
    ratio >= PORTRAIT_MIN_RATIO * (1 - RATIO_TOLERANCE) &&
    ratio <= PORTRAIT_MAX_RATIO * (1 + RATIO_TOLERANCE)
  ) {
    return { width: PORTRAIT_WIDTH, height: PORTRAIT_HEIGHT, fit: 'contain' };
  }
  return undefined;
}

/** The longest clip a video screen may be, in seconds (ADR-0018). */
export const VIDEO_MAX_SECONDS = 12;
/** The largest a video screen's MP4 may be: it is committed and ships in the image. */
export const VIDEO_MAX_BYTES = 3 * 1024 * 1024;
/** x264 quality per attempt: the second, lower one only when the first is over budget. */
export const VIDEO_CRF = [28, 34] as const;

/** True for a file `project:image` treats as a clip to encode, by its extension. */
export function isVideoFile(path: string): boolean {
  return /\.(?:mp4|mov|webm|mkv|m4v)$/i.test(path);
}

/**
 * The size a clip is encoded at, or a reason it is refused. Its shape must be one
 * a picture screen accepts (`screenFit`); it is then scaled to fit inside that
 * box without padding, since a video has no transparency to pad with, and to
 * even dimensions, which H.264 requires. Longer clips are refused, never trimmed.
 */
export function videoFit(
  width: number,
  height: number,
  seconds: number,
): { width: number; height: number } | { refused: string } {
  if (!(seconds > 0)) return { refused: 'it has no duration' };
  if (seconds > VIDEO_MAX_SECONDS) {
    return { refused: `it runs ${seconds.toFixed(1)} s, longer than ${VIDEO_MAX_SECONDS} s` };
  }
  const box = screenFit(width, height);
  if (!box) return { refused: `${width}×${height} is neither close to 1200×630 nor a phone portrait (9:21 to 9:16)` };
  const scale = Math.min(1, box.width / width, box.height / height);
  const even = (n: number) => Math.max(2, 2 * Math.floor((n * scale) / 2));
  return { width: even(width), height: even(height) };
}

/** True when `width`×`height` is close enough to 1.91:1 to be resized to it. */
export function fitsRatio(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  const target = IMAGE_WIDTH / IMAGE_HEIGHT;
  return Math.abs(width / height - target) / target <= RATIO_TOLERANCE;
}

const META_TAG = /<meta\b[^>]*>/gi;

function attribute(tag: string, name: string): string | undefined {
  const match = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

/**
 * The absolute `og:image` URL a page declares, or undefined when it declares
 * none. Falls back to `twitter:image`, which some sites set alone. A relative
 * value resolves against `pageUrl`; anything that is not http(s) is ignored.
 */
export function findOgImage(html: string, pageUrl: string): string | undefined {
  const content: Record<string, string> = {};
  for (const tag of html.match(META_TAG) ?? []) {
    const key = (attribute(tag, 'property') ?? attribute(tag, 'name'))?.toLowerCase();
    const value = attribute(tag, 'content');
    if (key && value && !(key in content)) content[key] = value;
  }

  for (const key of ['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image']) {
    const value = content[key]?.trim();
    if (!value) continue;
    try {
      const url = new URL(value.replaceAll('&amp;', '&'), pageUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString();
    } catch {
      // A malformed value is no image; try the next key.
    }
  }
  return undefined;
}
