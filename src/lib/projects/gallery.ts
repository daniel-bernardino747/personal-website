import type { Accomplishment } from '../corpus/schema';

/**
 * Splits the projects between the gallery and the "Other projects" list
 * (`.scratch/projects-and-agents/`). The gallery shows only projects with a
 * cover, since its card is the picture; the rest are listed in text below it,
 * so nothing shipped disappears. A project rises into the gallery on its own
 * once a cover is recorded in the Corpus. Both come newest first.
 */
export function splitGallery(projects: readonly Accomplishment[]): {
  pictured: Accomplishment[];
  textOnly: Accomplishment[];
} {
  const newestFirst = [...projects].sort((a, b) => b.date.localeCompare(a.date));
  return {
    pictured: newestFirst.filter((p) => (p.images?.length ?? 0) > 0),
    textOnly: newestFirst.filter((p) => (p.images?.length ?? 0) === 0),
  };
}
