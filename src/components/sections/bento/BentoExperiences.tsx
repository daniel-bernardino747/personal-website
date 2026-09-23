"use client";

import { type CareerStop, displayPeriod } from "@/lib/corpus/career";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * The career as a timeline — every Affiliation in order, each with the one
 * measured result that best stands for it. Order, dates and results all come
 * from the Corpus (see `careerTimeline`), so a new job or a newly Featured
 * Accomplishment reaches this cell as a `content/` edit, not a code change.
 */
export function BentoExperiences({ stops }: { stops: CareerStop[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="col-span-2 lg:col-span-2 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col shadow-2xl overflow-hidden relative group order-3 lg:order-2"
    >
      <div className="absolute inset-0 bg-linear-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <ol className="relative z-10 my-auto grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
        {stops.map(({ affiliation, isCurrent, highlight }, index) => (
          <li key={affiliation.id} className="relative flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex size-[11px] shrink-0">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-accent/60 animate-ping motion-reduce:animate-none" />
                )}
                <span
                  className={cn(
                    "relative size-[11px] rounded-full",
                    isCurrent ? "bg-accent" : "bg-muted-foreground/50",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums tracking-wider",
                  isCurrent ? "text-accent" : "text-muted-foreground/70",
                )}
              >
                {displayPeriod(affiliation.period)}
              </span>
              {/* Each stop draws the track on to the next one, across the column
                    gap, so the line runs node to node without crossing a label.
                    Hidden when the grid stacks 2×2 and a row's end isn't the next
                    stop in time. */}
              <span
                aria-hidden
                className={cn(
                  "hidden md:block h-px flex-1",
                  index < stops.length - 1
                    ? "-mr-4 bg-border"
                    : "bg-linear-to-r from-accent/60 to-transparent",
                )}
              />
            </div>

            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/90 leading-snug mb-2">
              {affiliation.organisation}
            </h3>

            {highlight && (
              <p className="text-[12px] font-semibold text-foreground leading-snug mb-1">
                {highlight}
              </p>
            )}
            <p
              title={affiliation.role}
              className="text-[11px] text-muted-foreground leading-snug line-clamp-2"
            >
              {affiliation.role}
            </p>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
