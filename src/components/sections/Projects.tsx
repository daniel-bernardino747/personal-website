"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayTitle, displayYear, parseStatement } from "@/lib/corpus/statement";
import { splitGallery } from "@/lib/projects/gallery";
import { CurvedGallery } from "./projects/CurvedGallery";
import { ProjectDialog } from "./projects/ProjectDialog";

/** How many technologies a row of the "Other projects" list names. */
const LIST_TECH = 3;

/**
 * The Projects section renders project-kind Accomplishments from the Corpus,
 * pictures first (`.scratch/projects-and-agents/`): the gallery shows only
 * projects with a cover, and every other project is listed in text below it, so
 * nothing shipped disappears. Both open the same dialog, where the screens and
 * the words are.
 *
 * Unlike a résumé — which shows only Records, so it never implies a number it
 * cannot back — the section includes projects whose metrics aren't recovered
 * yet. The page opts into that with `byKind('project', { includeDrafts: true })`.
 */
export function Projects({ projects }: { projects: Accomplishment[] }) {
  const t = useDictionary();
  const [open, setOpen] = useState<Accomplishment | null>(null);
  const { pictured, textOnly } = useMemo(() => splitGallery(projects), [projects]);

  return (
    <section id="projects" className="px-6 pt-8 pb-24 md:pt-12 md:pb-32">
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

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.projects.empty}</p>
        )}

        {pictured.length > 0 && (
          <CurvedGallery projects={pictured} onOpen={setOpen} holding={open !== null} />
        )}

        {textOnly.length > 0 && (
          <OtherProjects projects={textOnly} onOpen={setOpen} />
        )}
      </div>

      <ProjectDialog project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/**
 * Projects with no picture yet, as a quiet list: name, year and a few
 * technologies, which say what kind of work it was where a cut-off sentence
 * would not. A row opens the same dialog as a gallery card.
 */
function OtherProjects({
  projects,
  onOpen,
}: {
  projects: Accomplishment[];
  onOpen: (project: Accomplishment) => void;
}) {
  const t = useDictionary();

  return (
    <div className="mt-16">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {t.projects.others}
      </h3>
      <ul className="divide-y divide-border border-y border-border">
        {projects.map((project) => {
          const title = displayTitle(project) ?? project.id;
          const tech = parseStatement(project.statement).tech.slice(0, LIST_TECH);
          return (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => onOpen(project)}
                aria-label={t.projects.open(title)}
                className="group grid min-h-14 w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-1 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <span className="truncate font-semibold text-foreground transition-colors group-hover:text-accent-text">
                  {title}
                </span>
                <span className="col-start-1 row-start-2 truncate text-xs text-muted-foreground sm:col-start-2 sm:row-start-1">
                  {tech.join(" · ")}
                </span>
                <span className="col-start-2 row-span-2 row-start-1 font-mono text-xs text-muted-foreground sm:col-start-3 sm:row-span-1">
                  {displayYear(project)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
