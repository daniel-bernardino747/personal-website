"use client";

import { useIdentity } from "@/components/IdentityProvider";
import type { Affiliation } from "@/lib/corpus/schema";
import { motion } from "framer-motion";

/**
 * Background facts — where Daniel studies and the club he belongs to — read from
 * the Corpus rather than written into this markup, plus the Identity headline.
 * Editing what this cell says is now a `content/` edit, not a code change.
 */
export function BentoExperiences({
  affiliations,
}: {
  affiliations: Affiliation[];
}) {
  const identity = useIdentity();

  const cards: { heading: string; body: string }[] = [
    ...affiliations.map((affiliation) => ({
      heading: affiliation.organisation,
      body: affiliation.role,
    })),
    ...(identity.headline
      ? [{ heading: "Focus", body: identity.headline }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="col-span-2 lg:col-span-2 row-span-1 bg-surface rounded-3xl border border-border p-6 flex flex-col justify-between shadow-2xl overflow-hidden relative group order-3 lg:order-2"
    >
      <div className="absolute inset-0 bg-linear-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 p-4">
         <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-accent/40 transition-colors">Hover to read more</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full items-end mt-4 z-10">
        {cards.map((card, index) => (
          <div
            key={card.heading}
            className={
              // A divider before every card but the first — a top border when the
              // grid stacks, a left border once it is side by side. Robust to any
              // number of cards, unlike keying off a fixed index.
              index === 0
                ? "flex flex-col gap-2"
                : "flex flex-col gap-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6"
            }
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/90">
              {card.heading}
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
