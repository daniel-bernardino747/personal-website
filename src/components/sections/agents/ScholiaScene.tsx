"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { MessageSquare, StickyNote } from "lucide-react";
import { useId } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Story } from "./StoryPlayer";

/**
 * scholia, for someone who has never heard of an MCP server: a conversation
 * reaches a decision, the decision is kept as a note, and days later a new
 * question brings that note back into the answer.
 *
 * Steps: 0 the conversation · 1 a note is distilled from it · 2 the note goes
 * on the shelf · 3 days later, a new question · 4 the note lights up and the
 * answer quotes it.
 */
export const scholiaStory: Story = {
  Scene: ScholiaScene,
  durations: [2800, 1700, 2300, 2300, 3600],
  captionOf: [0, 1, 1, 2, 3],
  frames: [0, 2, 3, 4],
};

const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;
const enter = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function ScholiaScene({ step }: { step: number }) {
  const s = useDictionary().agents.scholia.scene;
  const later = step >= 3;
  const noteInChat = step === 1;
  const noteOnShelf = step >= 2;
  const recalled = step === 4;
  // Namespaces the note's `layoutId`, so the still frames drawn side by side under
  // reduced motion are four separate notes, not one note claimed four times.
  const group = useId();

  return (
    <LayoutGroup id={group}>
      <div className="grid h-[440px] grid-rows-[minmax(0,1fr)_auto] gap-3 rounded-3xl border border-border bg-foreground/[0.02] p-3 sm:h-[300px] sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] sm:grid-rows-1">
        {/* The conversation. */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
          <PanelLabel icon={<MessageSquare className="size-3" />} text={s.chat} />
          <div className="mt-2 flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              {!later && (
                <Bubble key="you1" from="you" text={s.you1} />
              )}
              {!later && (
                <Bubble key="ai1" from="ai" text={s.ai1} delay={0.5} />
              )}
              {noteInChat && <Note key="note-chat" text={s.note} />}
              {later && (
                <motion.span
                  key="later"
                  {...enter}
                  className="self-center rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {s.later}
                </motion.span>
              )}
              {later && <Bubble key="you2" from="you" text={s.you2} delay={0.2} />}
              {recalled && <Bubble key="ai2" from="ai" text={s.ai2} delay={0.7} quotes />}
            </AnimatePresence>
          </div>
        </div>

        {/* The notes it keeps. */}
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-background p-3">
          <PanelLabel icon={<StickyNote className="size-3" />} text={s.notes} />
          {/* Padded so the lit note's ring and its slight scale are not clipped. */}
          <ul className="-mx-1.5 mt-1 flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-1.5 py-1">
            {noteOnShelf && (
              <li>
                <Note text={s.note} lit={recalled} />
              </li>
            )}
            {s.older.map((older) => (
              <motion.li
                key={older}
                layout
                transition={SPRING}
                animate={{ opacity: later && !recalled ? 0.45 : 1 }}
                className="truncate rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground"
              >
                {older}
              </motion.li>
            ))}
          </ul>
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

function Bubble({
  from,
  text,
  delay = 0,
  quotes = false,
}: {
  from: "you" | "ai";
  text: string;
  delay?: number;
  /** The answer that draws on a kept note, marked with the note's icon. */
  quotes?: boolean;
}) {
  return (
    <motion.p
      layout
      initial={enter.initial}
      animate={{ ...enter.animate, transition: { ...SPRING, delay } }}
      exit={enter.exit}
      className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-snug ${
        from === "you"
          ? "self-end rounded-br-md bg-accent/15 text-foreground"
          : "self-start rounded-bl-md bg-foreground/[0.06] text-foreground"
      }`}
    >
      {quotes && <StickyNote className="mr-1 inline size-3 -translate-y-px text-accent-text" />}
      {text}
    </motion.p>
  );
}

/**
 * The kept decision. One `layoutId` across both panels, so it travels from the
 * conversation to the shelf instead of vanishing in one and appearing in the other.
 */
function Note({ text, lit = false }: { text: string; lit?: boolean }) {
  return (
    <motion.div
      layoutId="scholia-note"
      transition={SPRING}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: lit ? 1.03 : 1,
        boxShadow: lit
          ? "0 0 0 2px var(--accent), 0 8px 24px -6px color-mix(in oklch, var(--accent) 45%, transparent)"
          : "0 0 0 1px color-mix(in oklch, var(--accent) 35%, transparent)",
      }}
      className="flex items-start gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-[11px] font-medium leading-snug text-foreground"
    >
      <StickyNote className="mt-0.5 size-3 shrink-0 text-accent-text" />
      <span>{text}</span>
    </motion.div>
  );
}
