"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Bell, CalendarDays, Megaphone, MapPin, Send } from "lucide-react";
import { useId } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Story } from "./StoryPlayer";

/**
 * Radar Tech Sul SC, for someone who has never run a bot: the region's tech
 * events are announced in several places, in several shapes; the bot drops what
 * is off topic or out of the region, merges the announcements of one event into
 * one, posts it once to a Telegram channel, and reminds the channel the day before.
 *
 * Steps: 0 the announcements arrive · 1 two are ruled out · 2 the two left are
 * one event, merged · 3 it is posted to the channel · 4 the reminder.
 *
 * The event is fictional; the sources are named in text, never by their logos.
 */
export const radarStory: Story = {
  Scene: RadarScene,
  durations: [2600, 2000, 2000, 2600, 3400],
  captionOf: [0, 1, 1, 2, 3],
  frames: [0, 2, 3, 4],
};

/** What becomes of each announcement, in the dictionary's order. */
const FATE = ["event", "event", "offTopic", "outOfRegion"] as const;

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

function RadarScene({ step }: { step: number }) {
  const s = useDictionary().agents.radar.scene;
  // Namespaces the event's `layoutId`, so the still frames drawn side by side under
  // reduced motion are separate events, not one event claimed four times.
  const group = useId();
  const ruledOut = step >= 1;
  const merged = step === 2;
  const posted = step >= 3;
  const reminded = step === 4;
  const sameEvent = FATE.filter((f) => f === "event").length;

  return (
    <LayoutGroup id={group}>
      <div className="grid h-[500px] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3 rounded-3xl border border-border bg-foreground/[0.02] p-3 sm:h-[300px] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:grid-rows-1">
        {/* Where the events are announced today. */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
          <PanelLabel icon={<Megaphone className="size-3" />} text={s.sources} />
          <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-1.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {s.announcements.map(({ source, text }, i) => {
                const fate = FATE[i];
                // From step 2 the ruled-out ones are gone and the event's two
                // announcements have become the one merged card below.
                if (step >= 2) return null;
                const out = ruledOut && fate !== "event";
                return (
                  <motion.li
                    key={`${source}-${i}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: out ? 0.45 : 1, x: 0, transition: { ...SPRING, delay: step === 0 ? 0.25 * i : 0 } }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5"
                  >
                    <span className="shrink-0 rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground">
                      {source}
                    </span>
                    <span className={`min-w-0 flex-1 truncate text-[11px] text-foreground ${out ? "line-through" : ""}`}>{text}</span>
                    {out && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="shrink-0 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-red-700 dark:text-red-300"
                      >
                        {fate === "offTopic" ? s.offTopic : s.outOfRegion}
                      </motion.span>
                    )}
                  </motion.li>
                );
              })}
              {merged && (
                <motion.li key="merged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EventCard s={s} badge={s.merged(sameEvent)} />
                </motion.li>
              )}
            </AnimatePresence>
          </ul>
        </div>

        {/* The one place to look. */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
          <PanelLabel icon={<Send className="size-3" />} text={s.channel} />
          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2">
            {/* An earlier post, so the channel reads as a channel before this one lands. */}
            <div aria-hidden="true" className="flex flex-col gap-1 rounded-xl bg-foreground/[0.04] p-2 opacity-60">
              <span className="h-2 w-2/5 rounded bg-foreground/15" />
              <span className="h-2 w-3/5 rounded bg-foreground/10" />
            </div>
            {posted && <EventCard s={s} post />}
            <AnimatePresence>
              {reminded && (
                <motion.p
                  key="reminder"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.3 } }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 self-start rounded-xl bg-accent/15 px-2.5 py-1.5 text-[11px] font-medium text-foreground"
                >
                  <motion.span
                    animate={{ rotate: [0, -18, 14, -8, 0] }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="inline-flex"
                  >
                    <Bell className="size-3 text-accent-text" />
                  </motion.span>
                  {s.reminder}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </LayoutGroup>
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
 * The event, cleaned up. One `layoutId` from the merged card to the channel post,
 * so the clean event travels into the channel instead of being drawn twice.
 */
function EventCard({
  s,
  badge,
  post = false,
}: {
  s: { title: string; when: string; where: string; signUp: string };
  badge?: string;
  post?: boolean;
}) {
  return (
    <motion.div
      layoutId="radar-event"
      transition={SPRING}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-1 rounded-xl border border-accent/35 bg-accent/10 p-2.5"
    >
      <p className="text-xs font-bold text-foreground">{s.title}</p>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <CalendarDays className="size-3 shrink-0" />
        {s.when}
      </p>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        {s.where}
      </p>
      {badge && (
        <span className="mt-0.5 self-start rounded-full bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
          {badge}
        </span>
      )}
      {post && <span className="mt-0.5 self-start text-[11px] font-semibold text-accent-text underline">{s.signUp}</span>}
    </motion.div>
  );
}
