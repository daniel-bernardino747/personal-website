"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Dictionary } from "@/i18n/dictionary";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayTitle } from "@/lib/corpus/statement";
import type { AgentId } from "@/lib/projects/agents";
import { ProjectDialog } from "../projects/ProjectDialog";
import { scholiaStory } from "./ScholiaScene";
import { forgetStory } from "./ForgetScene";
import { radarStory } from "./RadarScene";
import { squareStory } from "./SquareScene";
import type { Story } from "./StoryPlayer";
import { StoryPlayer } from "./StoryPlayer";

/**
 * Each registered agent's animation and the dictionary entry holding its words.
 * Typed against `AgentId`, so an id cannot join `AGENT_IDS` without an
 * animation here, and the section never shows an agent it cannot explain.
 */
const STORIES: Record<
  AgentId,
  { story: Story; words: (t: Dictionary) => { summary: string; steps: readonly string[] } }
> = {
  "scholia-mcp": { story: scholiaStory, words: (t) => t.agents.scholia },
  "permit-compliance-analysis": { story: squareStory, words: (t) => t.agents.square },
  "dont-let-me-forget": { story: forgetStory, words: (t) => t.agents.forget },
  "radar-tech-sul-sc": { story: radarStory, words: (t) => t.agents.radar },
};

/**
 * The Agents section (`.scratch/projects-and-agents/`): projects with no screen
 * of their own, each shown as a band with its animation, one plain sentence and
 * its Metric, quoted exactly as the Corpus records it (ADR-0008). The statement
 * itself, technical and complete, is one click away in the project dialog.
 */
export function Agents({ agents }: { agents: (Accomplishment & { id: AgentId })[] }) {
  const t = useDictionary();
  const [open, setOpen] = useState<Accomplishment | null>(null);
  if (agents.length === 0) return null;

  return (
    <section id="agents" aria-labelledby="agents-title" className="scroll-mt-28 px-6 pt-8 pb-24 md:pt-12 md:pb-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent-text">{t.agents.eyebrow}</p>
          <h2 id="agents-title" className="text-3xl font-bold tracking-tight md:text-4xl">
            {t.agents.title}
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            style={{ originX: 0 }}
            className="mt-3 h-1 w-16 rounded-full bg-accent/60"
          />
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.agents.lede}</p>
        </motion.div>

        <div className="flex flex-col gap-20">
          {agents.map((agent) => {
            const { story, words } = STORIES[agent.id];
            const { summary, steps } = words(t);
            const title = displayTitle(agent) ?? agent.id;
            return (
              <article
                key={agent.id}
                aria-labelledby={`agent-${agent.id}`}
                className="grid items-start gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-10"
              >
                <StoryPlayer story={story} captions={steps} label={t.agents.stepsAria(title)} />

                <div className="flex flex-col md:pt-4">
                  <h3 id={`agent-${agent.id}`} className="text-2xl font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{summary}</p>
                  {agent.metric && (
                    <p className="mt-5 inline-flex w-fit items-start gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold leading-snug text-emerald-800 dark:text-emerald-300">
                      <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {agent.metric}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(agent)}
                    aria-label={t.agents.technicalAria(title)}
                    className="group mt-6 inline-flex min-h-11 w-fit cursor-pointer items-center gap-1.5 rounded-xl px-1 text-sm font-semibold text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {t.agents.technical}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </section>
  );
}
