"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Cell, Flaps } from "./Flaps";
import { flip, prefersReducedMotion, settle } from "./flip";
import s from "./labs.module.css";

export interface LabsDemo {
  id: string;
  title: string;
  /** The month the demo shipped, as the board shows it, e.g. "SEP 2026". */
  when: string;
  prose: string;
  href: string;
  image?: { src: string; alt: string };
}

const SETTLED_KEY = "labs-section:settled";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The Labs demos as a horizontal board: one departure per card, scrolled by
 * snap points or the two board buttons. The counter's flaps flip as the board
 * moves; the first time the section comes into view in a session, the visible
 * titles run through a few letters and settle where they were.
 */
export function LabsSlider({ demos }: { demos: LabsDemo[] }) {
  const track = useRef<HTMLOListElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(demos.length <= 1);

  // The card nearest the track's left edge is the one the board is on.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = [...el.children] as HTMLElement[];
    const left = el.scrollLeft;
    let nearest = 0;
    cards.forEach((card, i) => {
      if (Math.abs(card.offsetLeft - left) < Math.abs(cards[nearest].offsetLeft - left)) {
        nearest = i;
      }
    });
    // The last cards may all fit on screen before the last one can reach the left
    // edge; once the track can go no further, the board is on the last demo.
    const end = left + el.clientWidth >= el.scrollWidth - 4;
    setActive(end && left > 4 ? cards.length - 1 : nearest);
    setAtStart(left <= 4);
    setAtEnd(end);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  // The counter flips to the new position.
  useEffect(() => {
    const cells = [...(counter.current?.querySelectorAll<HTMLElement>("[data-cell]") ?? [])];
    const glyphs = `${pad(active + 1)}/${pad(demos.length)}`;
    const reduced = prefersReducedMotion();
    [...glyphs].forEach((g, i) => {
      if (cells[i]) void flip(cells[i], g, reduced ? 0 : 90);
    });
  }, [active, demos.length]);

  // The arrival settle, once per session, when the board is first seen.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    try {
      if (sessionStorage.getItem(SETTLED_KEY)) return;
    } catch {
      return;
    }
    let cancel: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          sessionStorage.setItem(SETTLED_KEY, "1");
        } catch {}
        const rows = [...el.querySelectorAll<HTMLElement>("[data-row]")].map((row) => [
          ...row.querySelectorAll<HTMLElement>("[data-cell]"),
        ]);
        cancel = settle(rows);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancel?.();
    };
  }, []);

  // Steps from where the track actually is, not from the counter: at the end of
  // the track the counter says the last demo while the left edge shows an earlier one.
  const go = (step: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const left = el.scrollLeft;
    const offsets = ([...el.children] as HTMLElement[]).map((card) => card.offsetLeft);
    const target =
      step === 1
        ? offsets.find((offset) => offset > left + 4)
        : offsets.findLast((offset) => offset < left - 4);
    if (target === undefined) return;
    el.scrollTo({
      left: target,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const initial = `${pad(1)}/${pad(demos.length)}`;

  return (
    <div className={s.board}>
      <div className={s.boardBar}>
        <span className={s.boardLabel}>Departures</span>
        <span className={`${s.flaps} ${s.counter}`} ref={counter}>
          <span className="sr-only" aria-live="polite">
            {`Demo ${active + 1} of ${demos.length}: ${demos[active]?.title ?? ""}`}
          </span>
          <span className={s.word} aria-hidden="true">
            {[...initial].map((g, i) => (
              <Cell key={i} glyph={g} />
            ))}
          </span>
        </span>
        <span className={s.controls}>
          <button type="button" className={s.control} onClick={() => go(-1)} disabled={atStart} aria-label="Previous demo">
            <svg viewBox="0 0 20 12" width="20" height="12" aria-hidden="true">
              <path d="M20 6H3M8 1L3 6l5 5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button type="button" className={s.control} onClick={() => go(1)} disabled={atEnd} aria-label="Next demo">
            <svg viewBox="0 0 20 12" width="20" height="12" aria-hidden="true">
              <path d="M0 6h17M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </span>
      </div>

      <ol ref={track} className={s.track} aria-label="Labs demos">
        {demos.map((demo) => (
          <li key={demo.id} className={s.slide} data-row="">
            <a href={demo.href} className={s.card} target="_blank" rel="noopener">
              <span className={s.frame}>
                {demo.image ? (
                  <Image
                    src={demo.image.src}
                    alt={demo.image.alt}
                    width={1200}
                    height={630}
                    sizes="(min-width: 64rem) 30rem, 85vw"
                    className={s.image}
                  />
                ) : (
                  <span className={s.noImage} aria-hidden="true" />
                )}
              </span>
              <span className={s.cardBody}>
                <Flaps text={demo.title} size="lg" />
                <span className={s.meta}>
                  <span className={s.metaLabel}>Shipped</span>
                  <Flaps text={demo.when} size="md" />
                </span>
                <span className={s.prose}>{demo.prose}</span>
                <span className={s.status} aria-hidden="true">
                  Open demo
                  <svg viewBox="0 0 20 12" width="20" height="12">
                    <path d="M0 6h17M12 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
