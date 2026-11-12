"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayYear } from "@/lib/corpus/statement";
import { CurvedGallery } from "./projects/CurvedGallery";

/**
 * The Projects section renders project-kind Accomplishments from the Corpus.
 * Unlike a résumé — which shows only Records, so it never implies a number it
 * cannot back — the gallery includes projects whose metrics aren't recovered
 * yet: the card states what the thing is and claims nothing numeric. The page
 * opts into that with `byKind('project', { includeDrafts: true })`.
 */
// The "every year" filter's state value; its label comes from the dictionary.
const ALL = "all";

/**
 * The Corpus id of the project that is this website. Lives here rather than in
 * the Corpus because "you are on it" is true of this page only — a résumé
 * rendered from the same statement must not claim it.
 */
const THIS_SITE_ID = "personal-website";

export function Projects({ projects }: { projects: Accomplishment[] }) {
  const t = useDictionary();
  const [activeYear, setActiveYear] = useState<string>(ALL);

  // Newest first, and years derived from the content rather than hardcoded, so a
  // captured project appears in the filter without a code change.
  const ordered = useMemo(
    () => [...projects].sort((a, b) => b.date.localeCompare(a.date)),
    [projects],
  );

  const years = useMemo(
    () => [...new Set(ordered.map(displayYear))],
    [ordered],
  );

  const visible = useMemo(
    () =>
      activeYear === ALL
        ? ordered
        : ordered.filter((project) => displayYear(project) === activeYear),
    [ordered, activeYear],
  );

  const filters = years.length > 1 ? [ALL, ...years] : [];

  return (
    <section id="projects" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent-text">
            {t.projects.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t.projects.title}
          </h2>
          {/* Draws itself in on scroll — motion that marks the section starting. */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            style={{ originX: 0 }}
            className="mt-3 h-1 w-16 rounded-full bg-accent/60"
          />
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            {t.projects.lede}
          </p>
        </motion.div>

        {filters.length > 0 && (
          <div
            role="group"
            aria-label={t.projects.filterAria}
            className="mb-10 flex flex-wrap gap-2"
          >
            {filters.map((filter) => {
              const isActive = filter === activeYear;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveYear(filter)}
                  className={`relative min-h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "border-accent/40 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="project-filter-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-accent/15"
                    />
                  )}
                  <span className="relative">{filter === ALL ? t.projects.all : filter}</span>
                </button>
              );
            })}
          </div>
        )}

        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.projects.empty}</p>
        ) : (
          <CurvedGallery projects={visible} thisSiteId={THIS_SITE_ID} />
        )}

        {/* Announced politely so a filter change isn't silent to a screen reader. */}
        <p aria-live="polite" className="sr-only">
          {t.projects.shown(visible.length)}
        </p>
      </div>
    </section>
  );
}
