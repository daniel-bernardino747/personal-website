"use client";

import { ArrowUpRight, Github, MousePointerClick, Sparkles, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { useDictionary } from "@/components/DictionaryProvider";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayTitle, displayYear, parseStatement } from "@/lib/corpus/statement";
import { ScreenCarousel } from "./ScreenCarousel";

/**
 * The Corpus id of the project that is this website. Lives here rather than in
 * the Corpus because "you are on it" is true of this page only — a résumé
 * rendered from the same statement must not claim it.
 */
export const THIS_SITE_ID = "personal-website";

/**
 * Everything about one project, opened from the gallery or the "Other projects"
 * list: its screens first, then the full statement, the Metric, the stack and
 * every public link. The cards only point here; this is where the words live.
 */
export function ProjectDialog({
  project,
  onClose,
}: {
  project: Accomplishment | null;
  onClose: () => void;
}) {
  const t = useDictionary();

  return (
    <Dialog.Root open={project !== null} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[301] max-h-[88vh] w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-background shadow-2xl focus:outline-none"
        >
          {project && <ProjectDetails project={project} />}
          <Dialog.Close
            aria-label={t.projects.close}
            className="absolute right-3 top-3 z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProjectDetails({ project }: { project: Accomplishment }) {
  const t = useDictionary();
  const { prose, tech, liveUrl, repoUrl } = parseStatement(project.statement);
  const title = displayTitle(project) ?? project.id;
  const isThisSite = project.id === THIS_SITE_ID;
  const screens = project.images ?? [];

  return (
    <article>
      {screens.length > 0 && <ScreenCarousel screens={screens} title={title} />}

      <div className={`flex flex-col px-6 pb-6 ${screens.length > 0 ? "pt-4" : "pt-6 pr-16"}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs tracking-widest text-muted-foreground">{displayYear(project)}</span>
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">
              <Sparkles className="size-3" aria-hidden="true" />
              {t.projects.featured}
            </span>
          )}
          {isThisSite && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-text">
              <MousePointerClick className="size-3" aria-hidden="true" />
              {t.projects.thisSite}
            </span>
          )}
        </div>

        <Dialog.Title className="mb-3 text-2xl font-bold tracking-tight text-foreground">{title}</Dialog.Title>

        <p className="text-sm leading-relaxed text-muted-foreground">{prose}</p>

        {/* Said here rather than in the Corpus statement: it is true of this page
            only, and would be nonsense on a résumé. */}
        {isThisSite && <p className="mt-3 text-sm font-medium text-accent-text">{t.projects.thisSiteNote}</p>}

        {project.metric && (
          <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
            {project.metric}
          </p>
        )}

        {tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tech.map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Every public link the statement records; a project with neither renders no row. */}
        {(liveUrl || repoUrl) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 text-sm font-semibold text-accent-text transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>{t.projects.visit(title)}</span>
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
                <span>{t.projects.onGitHub(title)}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
