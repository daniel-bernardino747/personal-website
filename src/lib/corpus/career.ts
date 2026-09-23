import type { Accomplishment, Affiliation } from './schema';

/**
 * One stop on the career timeline: an Affiliation in chronological place, with
 * the single measured result that best stands for it, when one exists.
 */
export interface CareerStop {
  affiliation: Affiliation;
  /** True when the Affiliation has a start but no end — where Daniel is now. */
  isCurrent: boolean;
  /**
   * The lead clause of the Affiliation's shortest Featured Metric. Absent when
   * nothing Featured and measured happened there — the stop then shows its role
   * alone rather than borrowing an unfeatured or unmeasured claim.
   */
  highlight?: string;
}

/** Undated Affiliations sort after dated ones; dated ones sort oldest first. */
function startKey(affiliation: Affiliation): string {
  return affiliation.period?.start ?? '￿';
}

/**
 * A Metric may bundle several claims separated by semicolons ("Page load 7s →
 * 1.5s; memory usage −30%"). The first clause is a complete claim on its own and
 * fits a timeline cell; the rest stays on the résumé.
 */
function leadClause(metric: string): string {
  return metric.split(';')[0].trim();
}

/**
 * Orders Affiliations into a timeline and pairs each with its headline result.
 * Only Featured Accomplishments with a Metric qualify — Featured is the Corpus's
 * word for "show this on the public site" — and among several, the shortest
 * Metric wins, since a timeline cell rewards the tersest proof.
 */
export function careerTimeline(
  affiliations: Affiliation[],
  accomplishments: Accomplishment[],
): CareerStop[] {
  return [...affiliations]
    .sort((a, b) => startKey(a).localeCompare(startKey(b)))
    .map((affiliation) => {
      const best = accomplishments
        .filter(
          (a) =>
            a.affiliationId === affiliation.id && a.featured && a.metric,
        )
        .sort((a, b) => a.metric!.length - b.metric!.length)[0];

      return {
        affiliation,
        isCurrent: Boolean(affiliation.period && !affiliation.period.end),
        highlight: best?.metric ? leadClause(best.metric) : undefined,
      };
    });
}

/** "2020–22", "2025–now", "2023", or "" when the period is unrecorded. */
export function displayPeriod(period: Affiliation['period']): string {
  if (!period) return '';
  const start = period.start.slice(0, 4);
  if (!period.end) return `${start}–now`;
  const end = period.end.slice(0, 4);
  if (end === start) return start;
  return start.slice(0, 2) === end.slice(0, 2)
    ? `${start}–${end.slice(2)}`
    : `${start}–${end}`;
}
