import { describe, expect, it } from 'vitest';

import {
  bandMetrics,
  cardWidthFor,
  centreSlot,
  placeOnBand,
  repeatsFor,
  slotDistance,
} from './curved-band';

describe('the curved band', () => {
  it('keeps the approved card on a wide screen and shrinks it on a phone', () => {
    expect(cardWidthFor(1600)).toBe(400);
    expect(cardWidthFor(390)).toBe(304);
    expect(cardWidthFor(200)).toBe(260);
    expect(bandMetrics(400)).toMatchObject({ cardHeight: 480, perspective: 1200 });
  });

  it('loops: the slot after the last is the first', () => {
    expect(slotDistance(0, 7.6, 8)).toBeCloseTo(0.4);
    expect(slotDistance(7, 0, 8)).toBe(-1);
    expect(centreSlot(-1, 8)).toBe(7);
    expect(centreSlot(8.4, 8)).toBe(0);
  });

  it('repeats a short list so the band never shows a hole', () => {
    expect(repeatsFor(2)).toBe(4);
    expect(repeatsFor(3)).toBe(3);
    expect(repeatsFor(17)).toBe(1);
    expect(repeatsFor(0)).toBe(0);
  });

  it('puts the centre card farthest away and fades the far ones', () => {
    expect(placeOnBand(0, 400).transform).toBe('translateZ(1180px) rotateY(0deg) translateZ(-1400px)');
    expect(placeOnBand(0, 400).opacity).toBe(1);
    expect(placeOnBand(4, 400).opacity).toBe(0);
    expect(placeOnBand(0, 400).zIndex).toBeGreaterThan(placeOnBand(2, 400).zIndex);
  });

  it('spaces neighbours by a card plus the gap along the arc', () => {
    // rotateY of one slot = (400 * 1.14) / 1400 rad ≈ 18.66°
    expect(placeOnBand(1, 400).transform).toContain('rotateY(-18.66');
  });
});
