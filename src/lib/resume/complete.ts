import type { Corpus } from '@/lib/corpus/loader';
import type { Accomplishment, Affiliation, Identity } from '@/lib/corpus/schema';
import { displayTitle, parseStatement } from '@/lib/corpus/statement';
import { SELECTION_VERSION, type Selection } from '@/lib/render/resume';

/**
 * The complete résumé: every Accomplishment in the Corpus, drafts included,
 * rendered through the same template as a tailored one.
 *
 * It is the one public Render Target that ignores `featured` — ADR-0009 records
 * why, and what it publishes. It is also the one Selection no model writes. A
 * tailored résumé needs judgement (what to keep, how to compress); a complete
 * one needs none, so it is assembled here mechanically and every line is the
 * Corpus's own prose. ADR-0003 holds by construction rather than by review, and
 * each entry still names its source file.
 */
export function buildCompleteSelection(
  corpus: Pick<Corpus, 'identity' | 'affiliations' | 'accomplishments' | 'drafts'>,
  siteUrl: URL,
): Selection {
  const { identity } = corpus;
  if (!identity) {
    throw new Error('The complete résumé needs content/identity.md.');
  }

  const everything = newestFirst([...corpus.accomplishments, ...corpus.drafts]);
  const education = everything.filter((a) => a.kind === 'education');
  const work = everything.filter((a) => a.kind !== 'education');

  const sections: Selection['sections'] = [
    section('Experience', affiliationGroups(work, corpus.affiliations)),
    section('Projects', standaloneGroups(work)),
    section('Education', [
      ...affiliationGroups(education, corpus.affiliations),
      ...standaloneGroups(education),
    ]),
    section('Skills', skillsGroups(everything, corpus.affiliations)),
  ].filter((candidate): candidate is Selection['sections'][number] => candidate !== null);

  return {
    version: SELECTION_VERSION,
    language: 'en',
    targetRole: 'Complete résumé',
    header: {
      name: identity.name,
      role: identity.role.join(' · '),
      location: identity.location,
      email: identity.social.email,
      links: [
        { label: 'LinkedIn', url: identity.social.linkedin },
        { label: 'GitHub', url: identity.social.github },
        { label: siteUrl.host.replace(/^www\./, ''), url: siteUrl.toString() },
      ],
    },
    summary: summary(identity),
    sections,
  };
}

/** The bio, then the terms of availability when they are recorded. */
function summary(identity: Identity): string {
  const { availability } = identity;
  if (!availability) return identity.bio;

  return `${identity.bio} Available for ${availability.engagement.join(' or ')} work — ${availability.workMode.toLowerCase()}, ${availability.hours}.`;
}

function section(
  title: string,
  groups: Selection['sections'][number]['groups'],
): Selection['sections'][number] | null {
  return groups.length > 0 ? { title, groups } : null;
}

/**
 * One group per Affiliation, most recent first, its Accomplishments beneath it.
 * An Affiliation with nothing recorded under it in this section is left out
 * rather than printed as an empty job.
 */
function affiliationGroups(
  accomplishments: Accomplishment[],
  affiliations: Affiliation[],
): Selection['sections'][number]['groups'] {
  return [...affiliations]
    .sort((a, b) => (b.period?.start ?? '').localeCompare(a.period?.start ?? ''))
    .map((affiliation) => ({
      affiliation,
      entries: accomplishments.filter((a) => a.affiliationId === affiliation.id),
    }))
    .filter(({ entries }) => entries.length > 0)
    .map(({ affiliation, entries }) => ({
      heading: heading(affiliation),
      entries: entries.map(entry),
    }));
}

/**
 * Work with no Affiliation — personal projects, independent study. A titled one
 * gets its own heading with its year; an untitled one has no name to head it
 * with, so it joins a bare list rather than borrowing a filename.
 *
 * The bare list comes first. Placed after a headed group it reads as that
 * group's last bullet — a CLI tool credited to an unrelated project, a solo
 * exercise credited to a bootcamp. First, it sits under the section title alone.
 */
function standaloneGroups(
  accomplishments: Accomplishment[],
): Selection['sections'][number]['groups'] {
  const standalone = accomplishments.filter((a) => a.affiliationId === undefined);
  const titled = standalone.filter((a) => displayTitle(a) !== undefined);
  const untitled = standalone.filter((a) => displayTitle(a) === undefined);

  // The year goes in the slot flush right of the name. As `period` it would
  // take a second line to itself, since a project has no role to share it with.
  const headed = titled.map((a) => ({
    heading: { organisation: displayTitle(a)!, location: a.date.slice(0, 4) },
    entries: [entry(a)],
  }));

  return untitled.length > 0 ? [{ entries: untitled.map(entry) }, ...headed] : headed;
}

/**
 * The Affiliation's context line. Roles are recorded as "… (Remote)"; the
 * template has a slot for location on the line above, so the suffix moves there
 * instead of repeating inside the role.
 */
function heading(affiliation: Affiliation): NonNullable<
  Selection['sections'][number]['groups'][number]['heading']
> {
  const remote = /\s*\(Remote\)$/;
  const isRemote = remote.test(affiliation.role);
  const { period } = affiliation;

  return {
    organisation: affiliation.organisation,
    ...(isRemote ? { location: 'Remote' } : {}),
    role: affiliation.role.replace(remote, ''),
    ...(period ? { period: `${period.start.slice(0, 4)} – ${period.end?.slice(0, 4) ?? 'Present'}` } : {}),
  };
}

/**
 * One Accomplishment as one bullet: its prose verbatim, then what it was built
 * with and where it can be seen. A titled record inside an Affiliation leads with
 * its title, so a named project reads as one among the employer's work — unless
 * the prose already opens with it, which would print the name twice.
 */
function entry(accomplishment: Accomplishment): Selection['sections'][number]['groups'][number]['entries'][number] {
  const { prose, tech, liveUrl, repoUrl } = parseStatement(accomplishment.statement);
  const tail = [
    tech.length > 0 ? `Built with ${tech.join(', ')}.` : '',
    liveUrl ? `Live: ${liveUrl}` : '',
    repoUrl ? `Repo: ${repoUrl}` : '',
  ].filter(Boolean);

  return {
    source: accomplishment.id,
    ...(needsLabel(accomplishment, prose) ? { label: accomplishment.title } : {}),
    text: [prose, ...tail].join(' '),
  };
}

/**
 * Every technology the Corpus names — Affiliation stacks first, then the
 * "Built with …" sentences — de-duplicated without regard to case. It cites the
 * Identity as its source because it belongs to no single record.
 */
function skillsGroups(
  accomplishments: Accomplishment[],
  affiliations: Affiliation[],
): Selection['sections'][number]['groups'] {
  const seen = new Set<string>();
  const stack: string[] = [];
  const candidates = [
    ...affiliations.flatMap((a) => a.stack),
    ...accomplishments.flatMap((a) => parseStatement(a.statement).tech),
  ];

  for (const tech of candidates) {
    const key = tech.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      stack.push(tech);
    }
  }

  if (stack.length === 0) return [];
  return [{ entries: [{ source: 'identity', label: 'Techs & tools', text: `${stack.join(', ')}.` }] }];
}

function needsLabel(accomplishment: Accomplishment, prose: string): boolean {
  const { title, affiliationId } = accomplishment;
  return title !== undefined && affiliationId !== undefined && !prose.startsWith(title);
}

function newestFirst(accomplishments: Accomplishment[]): Accomplishment[] {
  return [...accomplishments].sort((a, b) => b.date.localeCompare(a.date));
}
