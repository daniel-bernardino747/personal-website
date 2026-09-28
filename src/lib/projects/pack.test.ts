import { describe, expect, it } from 'vitest';

import { packRows } from './pack';

type Card = { id: string; featured?: boolean; hasImage?: boolean };
const card = (id: string, flags: Omit<Card, 'id'> = {}): Card => ({ id, ...flags });
const ids = (rows: ReturnType<typeof packRows<Card>>) =>
  rows.map((row) => row.map((cell) => cell.item.id).join('+'));

describe('packRows', () => {
  it('pairs cards in order when nothing gets in the way', () => {
    expect(ids(packRows([card('a'), card('b'), card('c'), card('d')]))).toEqual([
      'a+b',
      'c+d',
    ]);
  });

  it('gives a Featured card a row of its own', () => {
    expect(ids(packRows([card('a'), card('b'), card('f', { featured: true })]))).toEqual([
      'a+b',
      'f',
    ]);
  });

  it('pulls the next card up past a Featured one instead of leaving a hole', () => {
    const rows = packRows([card('a'), card('f', { featured: true }), card('b')]);
    expect(ids(rows)).toEqual(['a+b', 'f']);
  });

  it('pairs a picture with a picture when one is close by', () => {
    const rows = packRows([
      card('img1', { hasImage: true }),
      card('txt'),
      card('img2', { hasImage: true }),
      card('txt2'),
    ]);
    expect(ids(rows)).toEqual(['img1+img2', 'txt+txt2']);
  });

  it('lays a picture wide rather than pair it with a text card', () => {
    const rows = packRows([
      card('img1', { hasImage: true }),
      card('t1'),
      card('t2'),
      card('t3'),
      card('img2', { hasImage: true }),
    ]);
    expect(ids(rows)).toEqual(['img1', 't1+t2', 't3', 'img2']);
    expect(rows[0][0].wide).toBe(true);
  });

  it('lays a text card wide when only pictures are within reach', () => {
    const rows = packRows([
      card('txt'),
      card('img1', { hasImage: true }),
      card('img2', { hasImage: true }),
    ]);
    expect(ids(rows)).toEqual(['txt', 'img1+img2']);
  });

  it('never mixes a picture and a text card in one row', () => {
    const rows = packRows([
      card('a', { hasImage: true }),
      card('b'),
      card('f', { featured: true }),
      card('c', { hasImage: true }),
      card('d'),
      card('e', { hasImage: true }),
    ]);
    for (const row of rows) {
      expect(new Set(row.map((cell) => Boolean(cell.item.hasImage))).size).toBe(1);
    }
  });

  it('marks a card left alone as wide, and a Featured card as wide', () => {
    const rows = packRows([card('a'), card('b'), card('c'), card('f', { featured: true })]);
    expect(rows.map((row) => row.map((cell) => cell.wide))).toEqual([
      [false, false],
      [true],
      [true],
    ]);
  });

  it('keeps every card exactly once', () => {
    const input = [
      card('a', { hasImage: true }),
      card('f', { featured: true }),
      card('b'),
      card('c', { hasImage: true }),
      card('g', { featured: true }),
      card('d'),
    ];
    const out = packRows(input).flat().map((cell) => cell.item.id);
    expect(out.sort()).toEqual(input.map((c) => c.id).sort());
  });
});
