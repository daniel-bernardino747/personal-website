import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { listMindsetSlides } from './mindset';

function folder(files: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'mindset-'));
  for (const file of files) writeFileSync(join(dir, file), '');
  return dir;
}

describe('listMindsetSlides', () => {
  it('lists photos and clips in filename order', () => {
    const dir = folder(['02-run.mp4', '01-lift.webp', '03-swim.JPG']);
    expect(listMindsetSlides(dir)).toEqual([
      { src: '/mindset/01-lift.webp', kind: 'image' },
      { src: '/mindset/02-run.mp4', kind: 'video' },
      { src: '/mindset/03-swim.JPG', kind: 'image' },
    ]);
  });

  it('skips files that are neither', () => {
    const dir = folder(['notes.txt', '.DS_Store', 'lift.webp']);
    expect(listMindsetSlides(dir).map((s) => s.src)).toEqual(['/mindset/lift.webp']);
  });

  it('encodes names that are not URL-safe', () => {
    const dir = folder(['treino pesado.mp4']);
    expect(listMindsetSlides(dir)[0].src).toBe('/mindset/treino%20pesado.mp4');
  });

  it('treats a missing folder as an empty slideshow', () => {
    expect(listMindsetSlides(join(tmpdir(), 'does-not-exist-mindset'))).toEqual([]);
  });
});
