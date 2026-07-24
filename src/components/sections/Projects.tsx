"use client";

import { useReducedMotion, motion } from "framer-motion";
import type { Accomplishment } from "@/lib/corpus/schema";

/**
 * The Projects section renders project-kind Accomplishments from the Corpus.
 * Drafts (no Metric) are already excluded by the loader. Until real project
 * Accomplishments are captured, this shows an empty state rather than the
 * placeholder projects it used to carry.
 */
export function Projects({ projects }: { projects: Accomplishment[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="projects" className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">Projects</h2>
        <p className="text-muted max-w-2xl mb-12 text-lg">
          A selection of things I&apos;ve built — side projects, open source
          contributions, and professional work.
        </p>

        {projects.length === 0 ? (
          <p className="text-muted text-sm">
            Projects are being written up — check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {projects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : index * 0.1,
                }}
                className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow"
              >
                {/* Number */}
                <div
                  className="font-mono text-6xl font-bold text-gray-100 select-none leading-none shrink-0 group-hover:text-gray-200 transition-colors"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="flex-1 min-w-0">
                  {project.affiliation && (
                    <h3 className="text-xl font-semibold mb-2">
                      {project.affiliation.organisation}
                    </h3>
                  )}

                  <p className="text-muted text-sm leading-relaxed mb-4">
                    {project.statement}
                  </p>

                  {project.metric && (
                    <p className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {project.metric}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
