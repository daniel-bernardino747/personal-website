import type { Accomplishment } from './schema';

/**
 * An Accomplishment's statement is prose by design — one self-sufficient claim,
 * written once and reused by the site and every résumé. By convention the
 * capture skill closes a project statement with a "Built with …" sentence and,
 * when they exist, a "Live: <url>" and a "Repo: <url>", because that detail
 * belongs with the claim rather than in a parallel list that could drift from it.
 *
 * This module is the presentation seam that reads that convention back out, so a
 * project card can show a stack as chips and its public links as links. It only
 * ever *splits* text it was given — it never infers a technology or a URL that
 * isn't written down. An Accomplishment that doesn't follow the convention
 * degrades to prose with no chips, which is a correct card, just a plainer one.
 */
export interface ParsedStatement {
  /** The claim itself, with the trailing stack/link sentences removed. */
  prose: string;
  /** Technologies named in the "Built with …" sentence, in written order. */
  tech: string[];
  /** The deployed URL, when the statement records one. */
  liveUrl?: string;
  /** The public source repository, when the statement records one. */
  repoUrl?: string;
}

const BUILT_WITH = 'Built with ';
const LIVE = 'Live:';
const REPO = 'Repo:';

/** Only http(s) reaches an `href`; anything else is dropped rather than rendered. */
function safeUrl(candidate: string): string | undefined {
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

/** The first whitespace-delimited token after a marker, if it is a safe URL. */
function urlAfter(text: string, at: number, marker: string): string | undefined {
  const [candidate] = text
    .slice(at + marker.length)
    .trim()
    .split(/\s+/);
  return candidate ? safeUrl(candidate) : undefined;
}

export function parseStatement(statement: string): ParsedStatement {
  const trimmed = statement.trim();

  // The convention puts the stack last, so the *last* occurrence is the one that
  // closes the statement — prose that happens to say "built with care" earlier
  // won't be mistaken for it. The link markers are capitalised labels no ordinary
  // sentence writes, so the first occurrence of each is the real one.
  const builtAt = trimmed.lastIndexOf(BUILT_WITH);
  const liveAt = trimmed.indexOf(LIVE);
  const repoAt = trimmed.indexOf(REPO);

  const markers = [builtAt, liveAt, repoAt].filter((at) => at !== -1);
  if (markers.length === 0) {
    return { prose: trimmed, tech: [] };
  }

  const liveUrl = liveAt === -1 ? undefined : urlAfter(trimmed, liveAt, LIVE);
  const repoUrl = repoAt === -1 ? undefined : urlAfter(trimmed, repoAt, REPO);

  // The stack runs from its own marker up to whichever link marker follows it, so
  // the links may be written in either order without landing in the chips.
  let tech: string[] = [];
  if (builtAt !== -1) {
    const following = [liveAt, repoAt].filter((at) => at > builtAt);
    const end = following.length > 0 ? Math.min(...following) : trimmed.length;
    tech = trimmed
      .slice(builtAt + BUILT_WITH.length, end)
      .replace(/[.\s]+$/, '')
      .split(/,|\sand\s/)
      .map((entry) => entry.trim().replace(/\.$/, ''))
      .filter(Boolean);
  }

  // Markers that closed nothing (no stack, no usable URL) leave the statement
  // whole rather than silently truncating the prose.
  if (tech.length === 0 && liveUrl === undefined && repoUrl === undefined) {
    return { prose: trimmed, tech: [] };
  }

  return {
    prose: trimmed.slice(0, Math.min(...markers)).trim(),
    tech,
    liveUrl,
    repoUrl,
  };
}

/**
 * The heading a card shows. Prefers the recorded `title`, falls back to the
 * Affiliation that hosted the work, and otherwise returns nothing rather than
 * title-casing a filename into something Daniel never wrote.
 */
export function displayTitle(accomplishment: Accomplishment): string | undefined {
  return accomplishment.title ?? accomplishment.affiliation?.organisation;
}

/** The year an Accomplishment belongs to, for grouping and filtering. */
export function displayYear(accomplishment: Accomplishment): string {
  return accomplishment.date.slice(0, 4);
}
