"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Github, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayTitle, displayYear, parseStatement } from "@/lib/corpus/statement";
import {
  bandMetrics,
  cardWidthFor,
  centreSlot,
  MAX_CARD_WIDTH,
  placeOnBand,
  repeatsFor,
  slotDistance,
  VISIBLE_SLOTS,
} from "@/lib/projects/curved-band";

/** Cards per second while idle, and while the pointer rests on the band. */
const SPEED = 0.18;
const HOVER_SPEED = 0.04;
/** Pointer travel, in px, past which a press is a drag and not a click. */
const DRAG_THRESHOLD = 6;

/**
 * The project gallery: an infinite band curved like a cinema screen seen from
 * inside (geometry in `lib/projects/curved-band.ts`). It turns on its own,
 * slows under the pointer, and stops while focused, while a project is open,
 * when paused, or for anyone who prefers reduced motion. A side card is brought
 * to the centre by clicking it; the centre card opens the project dialog, which
 * the section owns. A card is the project's cover, its name and year, and
 * nothing to read: the words are in the dialog.
 *
 * To assistive tech it is a carousel (the APG pattern): one slide exposed at a
 * time, arrow keys and buttons to move, and a pause control for the rotation.
 * Positions are written to the DOM every frame, never through React state.
 */
export function CurvedGallery({
  projects,
  onOpen,
  holding,
}: {
  /** Projects with a cover; the card is the picture. */
  projects: Accomplishment[];
  onOpen: (project: Accomplishment) => void;
  /** True while a project is open elsewhere (the dialog), which stops the band. */
  holding: boolean;
}) {
  const t = useDictionary();
  const regionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const motion = useRef({
    offset: 0,
    target: null as number | null,
    hover: false,
    drag: null as null | { x: number; offset: number; moved: boolean },
    /** Set by a drag's pointerup, read by the click that follows it. */
    justDragged: false,
  });

  const [cardWidth, setCardWidth] = useState(MAX_CARD_WIDTH);
  const [centre, setCentre] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const count = projects.length;
  const slots = useMemo(
    () => Array.from({ length: repeatsFor(count) }, () => projects).flat(),
    [projects, count],
  );
  const metrics = bandMetrics(cardWidth);
  const running = !paused && !focused && !reduced && !holding;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setCardWidth(cardWidthFor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slots.length === 0) return;
    let last = performance.now();
    let frame = 0;
    let shownCentre = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const m = motion.current;
      if (m.drag) {
        // the pointer handlers move the offset
      } else if (m.target !== null) {
        m.offset += (m.target - m.offset) * Math.min(1, dt * (reduced ? 30 : 7));
        if (Math.abs(m.target - m.offset) < 0.002) {
          m.offset = m.target;
          m.target = null;
        }
      } else if (running && !document.hidden) {
        m.offset += (m.hover ? HOVER_SPEED : SPEED) * dt;
      }
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = placeOnBand(slotDistance(i, m.offset, slots.length), cardWidth);
        el.style.transform = `translate(-50%, -50%) ${p.transform}`;
        el.style.opacity = String(p.opacity);
        el.style.zIndex = String(p.zIndex);
      });
      const c = centreSlot(m.offset, slots.length);
      if (c !== shownCentre) {
        shownCentre = c;
        setCentre(c);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [slots.length, cardWidth, running, reduced]);

  const move = useCallback(
    (by: number) => {
      const m = motion.current;
      const next = Math.round(m.target ?? m.offset) + by;
      m.target = next;
      const project = slots[centreSlot(next, slots.length)];
      if (project) {
        setAnnouncement(t.projects.slide((centreSlot(next, slots.length) % count) + 1, count, displayTitle(project) ?? project.id));
      }
    },
    [slots, count, t],
  );

  if (count === 0) return null;

  return (
    <div className="relative -mx-6 -mt-6 xl:-mx-24">
      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t.projects.carousel}
        tabIndex={0}
        className="relative cursor-grab touch-pan-y select-none rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
        // Clipped at the sides only: the cards two slots out curve towards the
        // viewer and grow a little past the band, which stays short so it sits
        // close to the filters.
        style={{ height: metrics.bandHeight, overflowX: "clip", overflowY: "visible", perspective: `${metrics.perspective}px`, perspectiveOrigin: "50% 50%" }}
        // Keyboard focus stops the rotation (you are reading it); a mouse click
        // focuses the band too, and must not freeze it until the next click away.
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setFocused(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
            e.preventDefault();
            onOpen(slots[centre]);
          }
        }}
        onPointerEnter={() => (motion.current.hover = true)}
        onPointerLeave={() => {
          motion.current.hover = false;
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          motion.current.justDragged = false;
          motion.current.drag = { x: e.clientX, offset: motion.current.offset, moved: false };
          motion.current.target = null;
        }}
        onPointerMove={(e) => {
          const drag = motion.current.drag;
          if (!drag) return;
          const dx = e.clientX - drag.x;
          if (!drag.moved && Math.abs(dx) > DRAG_THRESHOLD) {
            drag.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          if (drag.moved) motion.current.offset = drag.offset - dx / (cardWidth * 0.8);
        }}
        onPointerUp={() => {
          const drag = motion.current.drag;
          motion.current.drag = null;
          if (drag?.moved) {
            motion.current.target = Math.round(motion.current.offset);
            motion.current.justDragged = true;
          }
        }}
        onClickCapture={(e) => {
          // A drag that ends over a card is not a click on it.
          if (motion.current.justDragged) {
            motion.current.justDragged = false;
            e.stopPropagation();
          }
        }}
      >
        {/* The band curves away into the page rather than being cut at the edge. */}
        <div aria-hidden="true" className="pointer-events-none absolute -inset-y-10 left-0 z-[200] w-16 bg-linear-to-r from-background to-transparent md:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute -inset-y-10 right-0 z-[200] w-16 bg-linear-to-l from-background to-transparent md:w-24" />

        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
          {slots.map((project, i) => {
            const isCentre = i === centre;
            const near = Math.abs(slotDistance(i, centre, slots.length)) < VISIBLE_SLOTS;
            return (
              <BandCard
                key={`${project.id}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                project={project}
                width={metrics.cardWidth}
                height={metrics.cardHeight}
                isCentre={isCentre}
                label={t.projects.slide((i % count) + 1, count, displayTitle(project) ?? project.id)}
                hidden={!isCentre}
                clickable={near}
                onActivate={() => {
                  if (isCentre) onOpen(project);
                  else move(Math.round(slotDistance(i, motion.current.offset, slots.length)));
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <BandButton label={t.projects.previous} onClick={() => move(-1)}>
          <ChevronLeft size={18} aria-hidden="true" />
        </BandButton>
        {!reduced && (
          <BandButton label={paused ? t.projects.play : t.projects.pause} onClick={() => setPaused((p) => !p)}>
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </BandButton>
        )}
        <BandButton label={t.projects.next} onClick={() => move(1)}>
          <ChevronRight size={18} aria-hidden="true" />
        </BandButton>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

    </div>
  );
}

function BandButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
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

function BandCard({
  project,
  width,
  height,
  isCentre,
  label,
  hidden,
  clickable,
  onActivate,
  ref,
}: {
  project: Accomplishment;
  width: number;
  height: number;
  isCentre: boolean;
  label: string;
  /**
   * Only the centre slide is exposed to assistive tech. Not `inert`: a side card
   * still takes a click (which brings it to the centre), and holds nothing focusable.
   */
  hidden: boolean;
  clickable: boolean;
  onActivate: () => void;
  ref: (el: HTMLElement | null) => void;
}) {
  const t = useDictionary();
  const { liveUrl, repoUrl } = useMemo(() => parseStatement(project.statement), [project.statement]);
  const title = displayTitle(project) ?? project.id;
  const cover = project.images?.[0];

  return (
    <article
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={hidden || undefined}
      onClick={clickable ? onActivate : undefined}
      className={`absolute left-0 top-0 flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-2xl will-change-transform [backface-visibility:hidden] ${
        isCentre ? "border-accent/30" : "border-border"
      } ${clickable ? "cursor-pointer" : "pointer-events-none"}`}
      style={{ width, height, opacity: 0 }}
    >
      {cover && (
        // The project's own picture, decoded lazily: most of the band is off screen.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.src} alt={cover.alt} loading="lazy" draggable={false} className="aspect-[1200/630] w-full shrink-0 object-cover" />
      )}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{displayYear(project)}</span>
          {(liveUrl || repoUrl) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {liveUrl ? <ArrowUpRight className="size-3" aria-hidden="true" /> : <Github className="size-3" aria-hidden="true" />}
              {liveUrl ? t.projects.live : t.projects.source}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <h3 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight">{title}</h3>
          {isCentre && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
              aria-label={t.projects.open(title)}
              className="shrink-0 cursor-pointer rounded-full text-xs font-medium text-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {t.projects.view}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
