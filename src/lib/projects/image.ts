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

/** The site path an image for `id` is recorded under, and served from. */
export function imageSrc(id: string): string {
  return `/projects/${id}.webp`;
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
