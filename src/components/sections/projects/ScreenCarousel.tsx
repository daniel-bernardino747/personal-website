"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";

/** Pointer travel, in px, past which a swipe changes the screen. */
const SWIPE = 40;

type Screen = { src: string; alt: string };

/**
 * A project's screens, one at a time, at the top of its dialog (ADR-0017). The
 * first is the cover. A landscape screen is 1200×630; a portrait one is a phone
 * fitted into a transparent 630×1200, so the stage turns taller when the set
 * holds one, and every screen is shown whole (`object-contain`).
 *
 * It never advances on its own: the visitor opened the dialog to look. Arrow
 * keys, the buttons, the dots and a swipe move it; reduced motion swaps the
 * slide for an instant change.
 */
export function ScreenCarousel({ screens, title }: { screens: Screen[]; title: string }) {
  const t = useDictionary();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const swipe = useRef<number | null>(null);

  const count = screens.length;
  const screen = screens[index];
  const hasPortrait = useHasPortrait(screens);

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + count) % count);
  };

  const stage = (
    <div
      className={`relative overflow-hidden rounded-2xl bg-foreground/5 ${
        hasPortrait ? "h-[min(62vh,520px)]" : "aspect-[1200/630]"
      }`}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={screen.src}
          custom={direction}
          initial={reduced ? false : { opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: direction * -40 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="absolute inset-0"
        >
          <Image
            src={screen.src}
            alt={screen.alt}
            fill
            sizes="(min-width: 768px) 720px, 92vw"
            draggable={false}
            className="object-contain"
            priority={index === 0}
          />
        </motion.div>
      </AnimatePresence>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10" />
    </div>
  );

  if (count === 1) return <div className="p-2">{stage}</div>;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t.projects.screens(title)}
      tabIndex={0}
      className="touch-pan-y p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        }
      }}
      onPointerDown={(e) => {
        swipe.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipe.current === null) return;
        const dx = e.clientX - swipe.current;
        swipe.current = null;
        if (Math.abs(dx) > SWIPE) go(index + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <div role="group" aria-roledescription="slide" aria-label={t.projects.screen(index + 1, count)}>
        {stage}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <StepButton label={t.projects.previousScreen} onClick={() => go(index - 1)}>
          <ChevronLeft size={18} aria-hidden="true" />
        </StepButton>
        <div className="flex items-center gap-1.5">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={t.projects.screen(i + 1, count)}
              aria-current={i === index || undefined}
              onClick={() => go(i)}
              className="grid size-6 cursor-pointer place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i === index ? "w-5 bg-accent" : "w-1.5 bg-foreground/25"
                }`}
              />
            </button>
          ))}
        </div>
        <StepButton label={t.projects.nextScreen} onClick={() => go(index + 1)}>
          <ChevronRight size={18} aria-hidden="true" />
        </StepButton>
      </div>

      <p aria-live="polite" className="sr-only">
        {t.projects.screen(index + 1, count)}
      </p>
    </div>
  );
}

/**
 * Whether any of the screens is a phone portrait. Neither the Corpus nor the file
 * name records the size, so each image is measured once it loads; until then the
 * stage is landscape, which is what the cover always is.
 */
function useHasPortrait(screens: Screen[]): boolean {
  const [portrait, setPortrait] = useState(false);
  const key = screens.map((s) => s.src).join("|");
  useEffect(() => {
    setPortrait(false);
    let live = true;
    for (const { src } of screens) {
      const probe = new window.Image();
      probe.onload = () => {
        if (live && probe.naturalHeight > probe.naturalWidth) setPortrait(true);
      };
      probe.src = src;
    }
    return () => {
      live = false;
    };
    // `key` stands for the list: a new array with the same screens is the same set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return portrait;
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 cursor-pointer place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
    </button>
  );
}
