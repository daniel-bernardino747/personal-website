"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleHelp, ClipboardList, FileText, Minus, Stamp, UserRound, X } from "lucide-react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Story } from "./StoryPlayer";

/**
 * Square AI, for someone who has never read a zoning code: a permit application
 * comes in, each rule is checked against the plan, the one that fails is shown on
 * the plan itself, and an engineer — never the system — makes the call.
 *
 * Steps: 0 the application arrives · 1 the plan is scanned, the first items are
 * checked · 2 the rest are checked · 3 the failing balcony is marked on the plan ·
 * 4 the suggested opinion goes to the engineer, who decides.
 *
 * The numbers are an illustration, not a real application.
 */
export const squareStory: Story = {
  Scene: SquareScene,
  durations: [2200, 1900, 1900, 2600, 3600],
  captionOf: [0, 1, 1, 2, 3],
  frames: [0, 2, 3, 4],
};

type Status = "ok" | "fail" | "na" | "unknown";

/** The status of each checklist item, in the dictionary's order: all four the system returns. */
const STATUS: readonly Status[] = ["ok", "fail", "na", "unknown"];
/** At which step each item is checked. */
const CHECKED_AT = [1, 1, 2, 2];

const STATUS_STYLE: Record<Status, { icon: typeof Check; className: string }> = {
  ok: { icon: Check, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  fail: { icon: X, className: "bg-red-500/15 text-red-700 dark:text-red-300" },
  na: { icon: Minus, className: "bg-foreground/10 text-muted-foreground" },
  unknown: { icon: CircleHelp, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
};

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

function SquareScene({ step }: { step: number }) {
  const s = useDictionary().agents.square.scene;
  const scanning = step === 1 || step === 2;
  const marked = step >= 3;
  const decided = step === 4;

  return (
    <div className="grid h-[540px] grid-rows-[minmax(0,1fr)_auto] gap-3 rounded-3xl border border-border bg-foreground/[0.02] p-3 sm:h-[340px] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:grid-rows-1">
      {/* The application: the plan and the documents that came with it. */}
      <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
        <PanelLabel icon={<FileText className="size-3" />} text={s.request} />
        <div className="relative mt-2 min-h-0 flex-1">
          <div className="relative h-full">
            <FloorPlan rooms={s.rooms} depth={s.depth} marked={marked} />
            {/* The pass over the plan, while the items are being checked. */}
            <AnimatePresence>
              {scanning && (
                <motion.span
                  key="scan"
                  aria-hidden="true"
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
                  className="pointer-events-none absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_12px_2px] shadow-accent/60"
                />
              )}
            </AnimatePresence>
          </div>
        </div>
        <ul className="mt-2 flex flex-wrap gap-1">
          {s.docs.map((doc, i) => (
            <motion.li
              key={doc}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: step === 0 ? 0.15 * i : 0 } }}
              className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {doc}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* What the system returns: a checklist, an opinion, and a person who decides. */}
      <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
        <PanelLabel icon={<ClipboardList className="size-3" />} text={s.checklist} />
        <ul className="mt-2 flex flex-col gap-1.5">
          {s.items.map((item, i) => {
            const status = STATUS[i];
            const checked = step >= CHECKED_AT[i];
            const { icon: Icon, className } = STATUS_STYLE[status];
            const pointed = marked && status === "fail";
            return (
              <motion.li
                key={item}
                animate={{ opacity: checked ? 1 : 0.35 }}
                className={`flex items-start gap-2 rounded-lg px-1.5 py-1 text-[11px] leading-snug text-foreground transition-colors ${
                  pointed ? "bg-red-500/10 ring-1 ring-red-500/40" : ""
                }`}
              >
                <span className={`grid size-4 shrink-0 place-items-center rounded-full ${checked ? className : "bg-foreground/5"}`}>
                  <AnimatePresence>
                    {checked && (
                      <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1, transition: { ...SPRING, delay: 0.25 * (i % 2) } }}>
                        <Icon className="size-2.5" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span>{item}</span>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <AnimatePresence>
            {decided && (
              <motion.p
                key="suggested"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: SPRING }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground"
              >
                {s.suggested}
              </motion.p>
            )}
            {decided && (
              <motion.div
                key="engineer"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.6 } }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-text">
                  <UserRound className="size-4" />
                </span>
                <span className="text-[11px] font-semibold text-foreground">{s.engineer}</span>
                <motion.span
                  initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6, transition: { ...SPRING, delay: 1.2 } }}
                  className="ml-auto inline-flex items-center gap-1 rounded-md border-2 border-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-text"
                >
                  <Stamp className="size-3" />
                  {s.decision}
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

/**
 * A plain floor plan: three rooms and a balcony that sticks out too far. Drawn in
 * `currentColor`, so it follows the theme; the balcony turns red, with its depth
 * dimensioned, once the check that fails is shown on the plan.
 */
function FloorPlan({
  rooms,
  depth,
  marked,
}: {
  rooms: { living: string; bedroom: string; bath: string; balcony: string };
  depth: string;
  marked: boolean;
}) {
  return (
    <svg viewBox="0 0 240 150" className="size-full text-muted-foreground" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Outer walls and partitions. */}
        <rect x="20" y="10" width="200" height="100" />
        <line x1="130" y1="10" x2="130" y2="110" />
        <line x1="130" y1="65" x2="220" y2="65" />
        {/* Door gaps, drawn as short breaks over the walls. */}
        <line x1="130" y1="30" x2="130" y2="44" stroke="var(--background)" strokeWidth="3" />
        <line x1="160" y1="65" x2="174" y2="65" stroke="var(--background)" strokeWidth="3" />
      </g>
      <g fontSize="9" fill="currentColor" fontFamily="var(--font-geist-sans), sans-serif">
        <text x="75" y="62" textAnchor="middle">{rooms.living}</text>
        <text x="175" y="40" textAnchor="middle">{rooms.bedroom}</text>
        <text x="175" y="92" textAnchor="middle">{rooms.bath}</text>
      </g>

      {/* The balcony, under the living room. */}
      <motion.rect
        x="40"
        y="110"
        width="80"
        height="30"
        strokeWidth="1.5"
        initial={false}
        animate={{
          stroke: marked ? "rgb(239 68 68)" : "currentColor",
          fill: marked ? "rgb(239 68 68 / 0.15)" : "rgb(0 0 0 / 0)",
        }}
        transition={{ duration: 0.4 }}
      />
      <text x="80" y="129" textAnchor="middle" fontSize="8" fill="currentColor">
        {rooms.balcony}
      </text>
      <AnimatePresence>
        {marked && (
          <motion.g
            key="dimension"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3 } }}
            exit={{ opacity: 0 }}
            stroke="rgb(239 68 68)"
            fill="rgb(239 68 68)"
          >
            <line x1="128" y1="110" x2="128" y2="140" strokeWidth="1" />
            <line x1="124" y1="110" x2="132" y2="110" strokeWidth="1" />
            <line x1="124" y1="140" x2="132" y2="140" strokeWidth="1" />
            <text x="134" y="128" fontSize="9" fontWeight="700" stroke="none">
              {depth}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
