import { describe, expect, it } from 'vitest';

import { findOgImage, fitsRatio, imageName, imageSrc, screenFit, SCREEN_NAME } from './image';

describe('findOgImage', () => {
  const page = 'https://labs.example.com/demo/thing';

  it('reads og:image in either attribute order', () => {
    expect(
      findOgImage('<meta property="og:image" content="https://cdn.example.com/a.png"/>', page),
    ).toBe('https://cdn.example.com/a.png');
    expect(
      findOgImage("<meta content='https://cdn.example.com/b.png' property='og:image'>", page),
    ).toBe('https://cdn.example.com/b.png');
  });

  it('resolves a relative og:image against the page URL', () => {
    expect(findOgImage('<meta property="og:image" content="/og.png">', page)).toBe(
      'https://labs.example.com/og.png',
    );
  });

  it('prefers og:image over twitter:image, and falls back to it', () => {
    const both =
      '<meta name="twitter:image" content="https://x.example/t.png">' +
      '<meta property="og:image" content="https://x.example/o.png">';
    expect(findOgImage(both, page)).toBe('https://x.example/o.png');
    expect(
      findOgImage('<meta name="twitter:image" content="https://x.example/t.png">', page),
    ).toBe('https://x.example/t.png');
  });

  it('ignores og:image:alt and friends when looking for the image itself', () => {
    expect(
      findOgImage('<meta property="og:image:alt" content="A portrait">', page),
    ).toBeUndefined();
  });

  it('decodes &amp; in the URL', () => {
    expect(
      findOgImage('<meta property="og:image" content="https://x.example/og?a=1&amp;b=2">', page),
    ).toBe('https://x.example/og?a=1&b=2');
  });

  it('returns undefined when the page declares no image, or a non-http one', () => {
    expect(findOgImage('<html><head><title>x</title></head></html>', page)).toBeUndefined();
    expect(
      findOgImage('<meta property="og:image" content="javascript:alert(1)">', page),
    ).toBeUndefined();
  });
});

describe('fitsRatio', () => {
  it('accepts the Open Graph size and near misses', () => {
    expect(fitsRatio(1200, 630)).toBe(true);
    expect(fitsRatio(1200, 627)).toBe(true);
    expect(fitsRatio(2400, 1260)).toBe(true);
  });

  it('refuses a portrait phone screenshot or a square', () => {
    expect(fitsRatio(1170, 2532)).toBe(false);
    expect(fitsRatio(1000, 1000)).toBe(false);
    expect(fitsRatio(1920, 1080)).toBe(false);
  });

  it('refuses degenerate sizes', () => {
    expect(fitsRatio(0, 630)).toBe(false);
  });
});

describe('imageSrc', () => {
  it('is a site path in the project folder, as the schema requires, the cover by default', () => {
    expect(imageSrc('latente')).toBe('/projects/latente/cover.webp');
    expect(imageSrc('latente', 'detail')).toBe('/projects/latente/detail.webp');
  });
});

describe('imageName', () => {
  it('is the file name without its extension, the key an alt is translated under', () => {
    expect(imageName('/projects/latente/cover.webp')).toBe('cover');
    expect(imageName(imageSrc('latente', 'mobile-home'))).toBe('mobile-home');
  });
});

describe('screenFit', () => {
  it('stores a landscape screen at the cover size', () => {
    expect(screenFit(2400, 1260)).toEqual({ width: 1200, height: 630, fit: 'cover' });
  });

  it('fits a phone screenshot into the portrait canvas without cropping it', () => {
    expect(screenFit(1170, 2532)).toEqual({ width: 630, height: 1200, fit: 'contain' });
    expect(screenFit(1080, 1920)).toEqual({ width: 630, height: 1200, fit: 'contain' });
    expect(screenFit(630, 1200)).toEqual({ width: 630, height: 1200, fit: 'contain' });
  });

  it('refuses a square, a 16:9 capture or anything taller than 9:21', () => {
    expect(screenFit(1000, 1000)).toBeUndefined();
    expect(screenFit(1920, 1080)).toBeUndefined();
    expect(screenFit(500, 1500)).toBeUndefined();
    expect(screenFit(0, 100)).toBeUndefined();
  });
});

describe('SCREEN_NAME', () => {
  it('takes words and dashes, nothing that could leave the folder', () => {
    expect(SCREEN_NAME.test('mobile-home')).toBe(true);
    expect(SCREEN_NAME.test('../cover')).toBe(false);
    expect(SCREEN_NAME.test('a b')).toBe(false);
    expect(SCREEN_NAME.test('x.webp')).toBe(false);
  });
});
