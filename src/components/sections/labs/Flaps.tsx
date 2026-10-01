import s from "./labs.module.css";

/**
 * Text as split-flap cells, one per glyph, grouped by word so a long title wraps
 * between words rather than mid-word. Screen readers get the text, not the cells.
 * Each cell carries its glyph in `data-glyph`, which `flip.ts` reads and flips.
 */
export function Flaps({ text, size }: { text: string; size: "lg" | "md" }) {
  const words = text.toUpperCase().split(" ");
  return (
    <span className={`${s.flaps} ${size === "lg" ? s.lg : s.md}`}>
      <span className="sr-only">{text}</span>
      <span className={s.words} aria-hidden="true">
        {words.map((word, w) => (
          <span key={w} className={s.word}>
            {[...word].map((g, i) => (
              <Cell key={i} glyph={g} />
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

/** One flap: the glyph, and the upper leaf that falls when it changes. */
export function Cell({ glyph }: { glyph: string }) {
  return (
    <span className={s.cell} data-cell="" data-glyph={glyph}>
      <span className={s.glyph}>{glyph}</span>
      <span className={s.leaf} data-leaf="">
        <span className={s.glyph}>{glyph}</span>
      </span>
    </span>
  );
}
