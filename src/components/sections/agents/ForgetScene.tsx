"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Archive, Check, Lightbulb, ListTodo, Loader } from "lucide-react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Story } from "./StoryPlayer";

/**
 * dont-let-me-forget, for someone who has never used a coding agent: an idea
 * turns up in the middle of other work, is kept in a second without derailing
 * it, comes back on a widening ladder (1 day → 3 days → 1 week → 2 weeks →
 * 4 weeks), and at the last rung, the Wall, can only be done or archived.
 *
 * Steps: 0 the idea is kept · 1–5 it comes back at each rung and is put off ·
 * 6 it reaches the Wall · 7 it is done.
 */
export const forgetStory: Story = {
  Scene: ForgetScene,
  durations: [2600, 1500, 1100, 950, 950, 1100, 2000, 2800],
  captionOf: [0, 1, 1, 1, 1, 1, 2, 3],
  frames: [0, 3, 6, 7],
};

const SPRING = { type: "spring", stiffness: 300, damping: 26 } as const;
/** The rung the idea sits on at each step; -1 before it joins the queue. */
const RUNG = [-1, 0, 1, 2, 3, 4, 5, 5];
const WALL = 5;

function ForgetScene({ step }: { step: number }) {
  const s = useDictionary().agents.forget.scene;
  const rung = RUNG[step];
  const atWall = rung === WALL;
  const done = step === 7;
  // Each rung after the first is a return the visitor put off.
  const postponed = Math.max(0, Math.min(rung, 4));
  const centre = (i: number) => `${((i + 0.5) / s.stops.length) * 100}%`;
  // The chip is wider than a rung on a phone, so at either end it leans inwards
  // instead of centring, and never spills past the panel.
  const anchor = (i: number) => (i === 0 ? "-20%" : i === WALL ? "-80%" : "-50%");

  return (
    <div className="grid h-[340px] grid-rows-[auto_minmax(0,1fr)] gap-3 rounded-3xl border border-border bg-foreground/[0.02] p-3 sm:h-[300px]">
      {/* What the visitor was doing, which the idea does not derail. */}
      <div className="rounded-2xl border border-border bg-background p-3">
        <PanelLabel icon={<Loader className="size-3" />} text={s.now} />
        <p className="mt-2 text-xs font-medium text-foreground">{s.task}</p>
        <div className="mt-2 h-7">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 ? (
              <motion.p
                key="idea"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.3 } }}
                exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-800 dark:text-amber-200"
              >
                <Lightbulb className="size-3 shrink-0" />
                {s.idea}
              </motion.p>
            ) : (
              <motion.p
                key="kept"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 py-1 text-[11px] text-muted-foreground"
              >
                <Check className="size-3 shrink-0 text-accent-text" />
                {s.kept}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* The queue: a ladder of returns that ends at the Wall. */}
      <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
        <PanelLabel icon={<ListTodo className="size-3" />} text={s.queue} />
        <div className="relative mt-1 min-h-0 flex-1">
          {/* The idea, hopping from rung to rung. */}
          <AnimatePresence>
            {rung >= 0 && (
              <motion.div
                key="chip"
                // Framer owns the transform, so the anchoring is its `x`, not a class.
                initial={{ opacity: 0, x: anchor(0), y: -24, left: centre(0) }}
                animate={{ opacity: 1, x: anchor(rung), y: 0, left: centre(rung), transition: SPRING }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="absolute top-1 flex flex-col items-center gap-0.5"
              >
                <span
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    done ? "bg-accent text-background" : "bg-amber-500/20 text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {done ? <Check className="size-3" /> : <Lightbulb className="size-3" />}
                  {done ? s.done : s.short}
                </span>
                {postponed > 0 && !done && (
                  <span className="whitespace-nowrap font-mono text-[9px] text-muted-foreground">{s.postponed(postponed)}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The rungs. */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <ol className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${s.stops.length}, minmax(0, 1fr))` }}>
            {s.stops.map((stop, i) => {
              const wall = i === WALL;
              const here = i === rung;
              return (
                <li key={stop} className="relative flex flex-col items-center justify-center">
                  {wall ? (
                    <motion.span
                      animate={{ scaleY: here ? 1.15 : 1 }}
                      className={`h-9 w-2 rounded-sm ${here ? "bg-foreground/80" : "bg-foreground/40"}`}
                    />
                  ) : (
                    <motion.span
                      animate={{ scale: here ? 1.5 : 1 }}
                      transition={SPRING}
                      className={`size-2.5 rounded-full ${i < rung || here ? "bg-accent" : "bg-foreground/20"}`}
                    />
                  )}
                  <span
                    className={`absolute bottom-1 whitespace-nowrap font-mono text-[10px] ${
                      here ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stop}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* At the Wall, only two ways out. */}
          <AnimatePresence>
            {atWall && (
              <motion.div
                key="choices"
                initial={{ opacity: 0, x: 8, y: "-50%" }}
                animate={{ opacity: 1, x: 0, y: "-50%", transition: { ...SPRING, delay: 0.3 } }}
                exit={{ opacity: 0 }}
                className="absolute right-[calc(100%/6+4px)] top-1/2 flex flex-col gap-1"
              >
                <motion.span
                  animate={{ scale: done ? 1.06 : 1 }}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    done ? "bg-accent text-background" : "border border-accent/50 text-accent-text"
                  }`}
                >
                  <Check className="size-3" />
                  {s.doIt}
                </motion.span>
                <motion.span
                  animate={{ opacity: done ? 0.35 : 1 }}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                >
                  <Archive className="size-3" />
                  {s.archive}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PanelLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {icon}
      {text}
    </p>
  );
}
