/**
 * The geometry of the project gallery: an infinite band curved like a cinema
 * screen seen from inside, with the perspective centred (chosen by Daniel from
 * the `spike/curved-band` prototype, 12/11/2026). The centre card is the
 * farthest point; neighbours curve towards the viewer.
 *
 * Every length scales with the card width, so the band keeps the approved shape
 * (a 400×480 card, a 56px gap, a 1400px radius) when a phone shrinks the card.
 */
export const CARD_RATIO = 1.2; // height / width
export const MAX_CARD_WIDTH = 400;
export const MIN_CARD_WIDTH = 260;

const GAP = 0.14; // of the card width
const RADIUS = 3.5;
const PULL_BACK = 0.55; // how far the centre card sits behind the screen plane
const PERSPECTIVE = 3;
/** Cards farther than this from the centre are faded out (and inert). */
export const VISIBLE_SLOTS = 3.2;
/** Over how many slots a card fades out before VISIBLE_SLOTS. */
const FADE_SLOTS = 1;
/** The band repeats a short list until it has this many slots, so it never runs dry. */
const MIN_SLOTS = 8;

export function cardWidthFor(containerWidth: number): number {
  return Math.round(Math.min(MAX_CARD_WIDTH, Math.max(MIN_CARD_WIDTH, containerWidth * 0.78)));
}

export function bandMetrics(cardWidth: number) {
  const cardHeight = Math.round(cardWidth * CARD_RATIO);
  return {
    cardWidth,
    cardHeight,
    perspective: cardWidth * PERSPECTIVE,
    // Tall enough for the edge cards, which curve towards the viewer and grow.
    bandHeight: Math.round(cardHeight * 1.12),
  };
}

/** How many times the list repeats on the band. */
export function repeatsFor(count: number): number {
  return count === 0 ? 0 : Math.ceil(MIN_SLOTS / count);
}

/** Slot `i` relative to the current offset, wrapped into [-slots/2, slots/2). */
export function slotDistance(i: number, offset: number, slots: number): number {
  let d = (i - offset) % slots;
  if (d < -slots / 2) d += slots;
  if (d >= slots / 2) d -= slots;
  return d;
}

/** The slot at the centre for an offset, as an index in [0, slots). */
export function centreSlot(offset: number, slots: number): number {
  return ((Math.round(offset) % slots) + slots) % slots;
}

export interface Placement {
  transform: string;
  opacity: number;
  zIndex: number;
}

/** Where a card `d` slots from the centre sits on the curved screen. */
export function placeOnBand(d: number, cardWidth: number): Placement {
  const r = cardWidth * RADIUS;
  // The arc between two card centres is one card plus the gap, so they never touch.
  const step = (cardWidth * (1 + GAP)) / r; // radians
  const angle = (d * step * 180) / Math.PI;
  const ad = Math.abs(d);
  return {
    transform: `translateZ(${r - cardWidth * PULL_BACK}px) rotateY(${-angle}deg) translateZ(${-r}px)`,
    // The far cards curve towards the viewer and grow past the band's height;
    // by then they are nearly transparent, so the band can stay short.
    opacity: ad >= VISIBLE_SLOTS ? 0 : Math.min(1, (VISIBLE_SLOTS - ad) / FADE_SLOTS),
    zIndex: Math.round(100 - ad * 10),
  };
}
