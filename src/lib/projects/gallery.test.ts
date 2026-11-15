import { describe, expect, it } from 'vitest';

import type { Accomplishment } from '../corpus/schema';
import { splitGallery } from './gallery';

const project = (id: string, date: string, pictured: boolean): Accomplishment => ({
  id,
  date,
  kind: 'project',
  statement: `${id}.`,
  featured: false,
  isDraft: true,
  ...(pictured ? { images: [{ src: `/projects/${id}/cover.webp`, alt: id }] } : {}),
});

describe('splitGallery', () => {
  const { pictured, textOnly } = splitGallery([
    project('old-pictured', '2023-01', true),
    project('plain', '2025-04', false),
    project('new-pictured', '2026-10', true),
    project('older-plain', '2024', false),
  ]);

  it('puts only projects with a cover in the gallery, newest first', () => {
    expect(pictured.map((p) => p.id)).toEqual(['new-pictured', 'old-pictured']);
  });

  it('lists every other project in text, newest first, so none disappears', () => {
    expect(textOnly.map((p) => p.id)).toEqual(['plain', 'older-plain']);
  });

  it('treats an empty list of images as no cover', () => {
    expect(splitGallery([{ ...project('empty', '2026', false), images: [] }]).textOnly).toHaveLength(1);
  });
});
