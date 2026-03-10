"use client";

import { useReducedMotion, motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { projects } from "@/data/projects";
import { TechBadge } from "@/components/ui/TechBadge";

export function Projects() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="projects" className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">Projects</h2>
        <p className="text-muted max-w-2xl mb-12 text-lg">
          A selection of things I&apos;ve built — side projects, open source
          contributions, and professional work.
        </p>

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
                {project.id}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} on GitHub`}
                      className="text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
                    >
                      <Github size={18} strokeWidth={2} aria-hidden="true" />
                    </a>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} live demo`}
                        className="text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
                      >
                        <ExternalLink size={18} strokeWidth={2} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-muted text-sm leading-relaxed mb-4">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <TechBadge key={tech} label={tech} />
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
