import type { Accomplishment } from '../corpus/schema';
import { parseStatement } from '../corpus/statement';

/** Where Labs serves its demos (the `prospect-me` repository). */
export const LABS_ORIGIN = 'https://labs.teamdbsolutions.com';

const LABS_HOST = new URL(LABS_ORIGIN).host;

/**
 * A project is a Labs demo when the Live link its statement records is served by
 * Labs. Read from the Corpus as written, so a demo captured later joins the Labs
 * section without a code change; the whole host is compared, never a suffix.
 */
export function isLabsDemo(project: Accomplishment): boolean {
  const { liveUrl } = parseStatement(project.statement);
  return liveUrl !== undefined && new URL(liveUrl).host === LABS_HOST;
}

/**
 * Splits the projects between the Labs section and the general gallery, so each
 * project shows once on the page. Order is kept; Labs demos come newest first.
 */
export function splitLabs(projects: readonly Accomplishment[]): {
  labs: Accomplishment[];
  rest: Accomplishment[];
} {
  const labs: Accomplishment[] = [];
  const rest: Accomplishment[] = [];
  for (const project of projects) (isLabsDemo(project) ? labs : rest).push(project);
  labs.sort((a, b) => b.date.localeCompare(a.date));
  return { labs, rest };
}
