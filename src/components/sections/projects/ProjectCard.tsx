"use client";

import { ArrowUpRight, Github, MousePointerClick, Sparkles } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

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
  index,
  featured,
  isThisSite = false,
}: {
  project: Accomplishment;
  index: number;
  featured: boolean;
  /** True for the project that *is* this website, which says so on its card. */
  isThisSite?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const { prose, tech, liveUrl, repoUrl } = parseStatement(project.statement);
  const title = displayTitle(project);
  const year = displayYear(project);

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
    const fractionX = (event.clientX - bounds.left) / bounds.width;
    const fractionY = (event.clientY - bounds.top) / bounds.height;
    pointerX.set(fractionX);
    pointerY.set(fractionY);
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
      className={featured ? "sm:col-span-2" : undefined}
      style={{ perspective: 1000 }}
    >
      <motion.article
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={prefersReducedMotion ? undefined : { y: -6 }}
        transition={{ type: "spring", ...SPRING }}
        style={prefersReducedMotion ? undefined : { rotateX, rotateY }}
        className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-2xl transition-colors duration-300 hover:border-accent/40 focus-within:border-accent/40"
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

        {/* The index, as texture rather than information. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 right-4 select-none font-mono text-7xl font-bold leading-none text-foreground/[0.06] transition-colors duration-500 group-hover:text-accent/20"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative flex h-full flex-col">
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
            layout="position"
            className={`max-w-2xl text-sm leading-relaxed text-muted-foreground ${
              expanded ? "" : "line-clamp-4"
            }`}
          >
            {prose}
          </motion.p>

          {/* Only offered when there is genuinely more to read. */}
          {prose.length > 260 && (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              className="mt-2 -ml-1 self-start rounded-md px-1 py-2 text-xs font-semibold text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {expanded ? "Show less" : "Read more"}
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
              {tech.map((item, techIndex) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : techIndex * 0.02,
                    duration: 0.25,
                  }}
                  className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-accent/25 group-hover:text-foreground"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          )}

          {/* Every public link the statement records, so nothing that is reachable
              is left un-clickable. A project with neither renders no row at all. */}
          {(liveUrl || repoUrl) && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1">
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
