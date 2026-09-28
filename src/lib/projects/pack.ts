/**
 * Lays the project gallery out as explicit two-column rows, so the page's DOM
 * order is the order a visitor sees — CSS dense packing would fill holes by
 * moving cards visually and leave keyboard focus jumping behind them.
 *
 * The list stays newest-first; a card only moves up by at most `LOOKAHEAD`
 * places, and only to fill a row. A Featured card takes a row of its own. A
 * card left with no partner takes a row too, rather than sitting beside an
 * empty cell that reads as a missing project. Cards pair only with their own
 * kind — picture with picture, text with text — because a text-only card beside
 * a picture leaves a hollow the height of the image. A card with no partner of
 * its kind within reach takes the row alone; a picture card laid wide shows its
 * image beside the text.
 */

/** How far ahead a card may be pulled up to complete a row. */
const LOOKAHEAD = 2;

export interface PackedCell<T> {
  item: T;
  /** Spans both columns: a Featured card, or one left without a partner. */
  wide: boolean;
}

export function packRows<T extends { featured?: boolean; hasImage?: boolean }>(
  items: readonly T[],
): PackedCell<T>[][] {
  const queue = [...items];
  const rows: PackedCell<T>[][] = [];

  while (queue.length > 0) {
    const first = queue.shift()!;
    if (first.featured) {
      rows.push([{ item: first, wide: true }]);
      continue;
    }

    const window = queue.slice(0, LOOKAHEAD + 1);
    const partner = window
      .map((item, at) => ({ item, at }))
      .find(
        ({ item }) =>
          !item.featured && Boolean(item.hasImage) === Boolean(first.hasImage),
      );

    if (!partner) {
      rows.push([{ item: first, wide: true }]);
      continue;
    }

    queue.splice(partner.at, 1);
    rows.push([
      { item: first, wide: false },
      { item: partner.item, wide: false },
    ]);
  }

  return rows;
}
