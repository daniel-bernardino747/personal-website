"use client";

import { ArrowUpRight, Github, MousePointerClick, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import type { Accomplishment } from "@/lib/corpus/schema";
import {
  displayTitle,
  displayYear,
  parseStatement,
} from "@/lib/corpus/statement";

/** Degrees of tilt at the far edge of a card. Past ~8° the text starts to smear. */
const TILT = 5;
const SPRING = { stiffness: 220, damping: 22, mass: 0.6 } as const;

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 26 },
  },
  // Leaving is quicker than arriving, so a filter change feels answered rather
  // than waited on.
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export function ProjectCard({
  project,
  numeral,
  featured,
  wide,
  isThisSite = false,
}: {
  project: Accomplishment;
  /** The faint index numeral, shown only on a card without a picture. */
  numeral?: number;
  featured: boolean;
  /** Spans both columns — a Featured card, or one the row packing left alone. */
  wide: boolean;
  /** True for the project that *is* this website, which says so on its card. */
  isThisSite?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const proseRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);

  const { prose, tech, liveUrl, repoUrl } = parseStatement(project.statement);
  const title = displayTitle(project);
  const year = displayYear(project);

  const image = project.image;
  const hasImage = image !== undefined;
  // A picture leads a two-column card side by side; everywhere else it sits on top.
  const sideBySide = wide && hasImage;
  // A card with a picture tilts nothing: a 5° lean smears the text most Open Graph
  // images carry. The tilt and the index numeral stay on the text-only card, where
  // they are the texture the picture provides here.
  const tilts = !hasImage && !prefersReducedMotion;
  const clampLines = hasImage ? "line-clamp-3" : "line-clamp-4";

  /**
   * "Read more" is offered only when the clamp actually hides text, measured
   * rather than guessed from a character count — how much fits in three or four
   * lines depends on the card's width, which changes with the breakpoint and
   * with whether the card spans both columns.
   */
  useLayoutEffect(() => {
    const element = proseRef.current;
    if (!element || expanded) return;
    const measure = () =>
      setOverflows(element.scrollHeight > element.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  // Pointer position as a 0–1 fraction of the card, driving the tilt. Hooks run
  // unconditionally; whether they reach `style` is what reduced motion decides.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [TILT, -TILT]), SPRING);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-TILT, TILT]), SPRING);

  /**
   * The glow follows the cursor through CSS custom properties rather than React
   * state, so a pointer move repaints without re-rendering the card — the same
   * trick the page-wide spotlight in `globals.css` uses, which is why the two
   * read as one effect.
   */
  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (prefersReducedMotion) return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    if (tilts) {
      pointerX.set((event.clientX - bounds.left) / bounds.width);
      pointerY.set((event.clientY - bounds.top) / bounds.height);
    }
    surfaceRef.current?.style.setProperty(
      "--spot-x",
      `${event.clientX - bounds.left}px`,
    );
    surfaceRef.current?.style.setProperty(
      "--spot-y",
      `${event.clientY - bounds.top}px`,
    );
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.div
      layout
      variants={cardVariants}
      exit="exit"
      className={wide ? "sm:col-span-2" : undefined}
      style={{ perspective: 1000 }}
    >
      <motion.article
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={prefersReducedMotion ? undefined : { y: -6 }}
        transition={{ type: "spring", ...SPRING }}
        style={tilts ? { rotateX, rotateY } : undefined}
        className={`group relative h-full overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl transition-colors duration-300 hover:border-accent/40 focus-within:border-accent/40 ${
          sideBySide
            ? "flex flex-col sm:grid sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
            : "flex flex-col"
        } ${hasImage ? "" : "p-6"}`}
      >
        {/* Cursor-tracked glow. Purely decorative, and inert to the pointer. */}
        <div
          ref={surfaceRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
          style={{
            background:
              "radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--accent) 14%, transparent), transparent 70%)",
          }}
        />

        {/* The index, as texture rather than information — only where no picture
            already gives the card its texture. */}
        {numeral !== undefined && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 right-4 select-none font-mono text-7xl font-bold leading-none text-foreground/[0.06] transition-colors duration-500 group-hover:text-accent/20"
          >
            {String(numeral).padStart(2, "0")}
          </span>
        )}

        {image && (
          <ProjectWindow
            image={image}
            title={title}
            href={liveUrl ?? repoUrl}
            destination={liveUrl ? "Live" : "Source"}
            failed={imageFailed}
            onFail={() => setImageFailed(true)}
          />
        )}

        <div
          className={`relative flex flex-1 flex-col ${
            hasImage ? (sideBySide ? "p-6 pt-4 sm:pt-6 sm:pl-4" : "px-6 pt-4 pb-6") : ""
          }`}
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              {year}
            </span>
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
                <Sparkles className="size-3" aria-hidden="true" />
                Featured
              </span>
            )}
            {isThisSite && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-text">
                <MousePointerClick className="size-3" aria-hidden="true" />
                You&apos;re looking at it
              </span>
            )}
          </div>

          {title && (
            <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">
              {title}
            </h3>
          )}

          <motion.p
            ref={proseRef}
            layout="position"
            className={`max-w-2xl text-sm leading-relaxed text-muted-foreground ${
              expanded ? "" : clampLines
            }`}
          >
            {prose}
          </motion.p>

          {/* Only offered when there is genuinely more to read. */}
          {(overflows || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="mt-2 -ml-1 self-start rounded-md px-1 py-2 text-xs font-semibold text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {expanded ? "Show less" : "Read more"}
              {title && <span className="sr-only"> about {title}</span>}
            </button>
          )}

          {/* Said in the card rather than in the Corpus statement: it is true of
              this page only, and would be nonsense on a résumé. */}
          {isThisSite && (
            <p className="mt-3 text-sm font-medium text-accent-text">
              This is the site you&apos;re browsing right now — the source below
              is what builds this page.
            </p>
          )}

          {project.metric && (
            <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-emerald-500"
              />
              {project.metric}
            </p>
          )}

          {tech.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {tech.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-accent/25 group-hover:text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* Every public link the statement records, so nothing that is reachable
              is left un-clickable. A project with neither renders no row at all. */}
          {(liveUrl || repoUrl) && (
            <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-5">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 text-sm font-semibold text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {/* The name is in the label so a screen reader hears which project. */}
                  <span>Visit {title ?? "the live site"}</span>
                  <ArrowUpRight
                    className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Github className="size-4" aria-hidden="true" />
                  <span>
                    {title ? `${title} on GitHub` : "Source on GitHub"}
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}

/**
 * The project's picture, set into the card as a window: inset from the card's
 * edge with concentric corners, and a hairline on the glass so a light Open
 * Graph card on the light theme — or a dark screenshot on the dark one — keeps
 * its edge. The whole pane links out, but only for the pointer: the text link
 * below is the one a keyboard or screen reader meets, and the image stays
 * content, so its alt is still read.
 */
function ProjectWindow({
  image,
  title,
  href,
  destination,
  failed,
  onFail,
}: {
  image: { src: string; alt: string };
  title?: string;
  href?: string;
  destination: "Live" | "Source";
  failed: boolean;
  onFail: () => void;
}) {
  return (
    <div className="relative p-2 sm:self-start">
      <div className="group/window relative aspect-[1200/630] overflow-hidden rounded-2xl bg-foreground/5">
        {failed ? (
          // A picture that did not arrive leaves the name, not a broken-image icon.
          <div className="flex size-full items-center justify-center p-6 text-center text-sm font-semibold text-muted-foreground">
            {title ?? image.alt}
          </div>
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={630}
            sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
            onError={onFail}
            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/window:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/window:scale-100"
          />
        )}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10"
        />

        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden="true"
            tabIndex={-1}
            className="absolute inset-0"
          >
            <span className="absolute top-3 right-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground opacity-0 shadow-[0_2px_8px_-2px_rgb(0_0_0/0.25)] transition duration-300 ease-out group-hover/window:translate-y-0 group-hover/window:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              {destination}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
