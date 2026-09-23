import { describe, expect, it } from 'vitest';

import { getCorpus } from '@/lib/corpus/site';
import type { Accomplishment, Affiliation, Identity } from '@/lib/corpus/schema';
import { renderSelectionToTex, type Selection } from '@/lib/render/resume';

import { buildCompleteSelection } from './complete';

const SITE = new URL('https://www.example.com');

const identity: Identity = {
  name: 'Ada Lovelace',
  initials: 'AL',
  role: ['Software Engineer', 'Mathematician'],
  location: 'London, United Kingdom',
  bookingUrl: 'https://cal.com/ada',
  social: {
    github: 'https://github.com/ada',
    linkedin: 'https://linkedin.com/in/ada',
    email: 'ada@example.com',
  },
  availability: { engagement: ['Contractor'], workMode: 'Remote', hours: '9am–5pm London time' },
  bio: 'I write programs and prove they are correct.',
};

const engine: Affiliation = {
  id: 'engine-co',
  organisation: 'Engine Co',
  role: 'Programmer (Remote)',
  period: { start: '1842', end: '1843' },
  stack: ['Difference Engine'],
};

const society: Affiliation = {
  id: 'society',
  organisation: 'Analytical Society',
  role: 'Student',
  period: { start: '1830' },
  stack: [],
};

function record(overrides: Partial<Accomplishment> & { id: string }): Accomplishment {
  const base = { date: '1843', kind: 'engineering' as const, featured: false, statement: `Statement of ${overrides.id}.`, ...overrides };
  return { ...base, isDraft: base.metric === undefined };
}

const records = [
  record({ id: 'featured-note', affiliationId: 'engine-co', affiliation: engine, featured: true, metric: 'first program' }),
  record({ id: 'unfeatured-note', affiliationId: 'engine-co', affiliation: engine, date: '1842', metric: 'two notes' }),
  record({
    id: 'side-project',
    kind: 'project',
    title: 'Side Project',
    statement: 'A thing built alone. Built with Punch cards, Brass. Repo: https://github.com/ada/side',
    metric: 'one card',
  }),
];
const drafts = [
  record({ id: 'draft-idea', affiliationId: 'engine-co', affiliation: engine, date: '1841' }),
  record({ id: 'untitled-tool', kind: 'project' }),
  record({ id: 'coursework', kind: 'education', affiliationId: 'society', affiliation: society }),
];

function sources(selection: Selection): string[] {
  return selection.sections.flatMap((s) => s.groups.flatMap((g) => g.entries.map((e) => e.source)));
}

describe('the complete résumé', () => {
  const selection = buildCompleteSelection(
    { identity, affiliations: [society, engine], accomplishments: records, drafts },
    SITE,
  );

  it('carries every Accomplishment exactly once — Featured or not, draft or record', () => {
    const cited = sources(selection).filter((source) => source !== 'identity');
    expect(cited.sort()).toEqual([...records, ...drafts].map((a) => a.id).sort());
  });

  it('quotes each statement verbatim, with its stack and links after it', () => {
    const entries = selection.sections.flatMap((s) => s.groups.flatMap((g) => g.entries));
    expect(entries.find((e) => e.source === 'side-project')?.text).toBe(
      'A thing built alone. Built with Punch cards, Brass. Repo: https://github.com/ada/side',
    );
  });

  it('groups work under its Affiliation, newest first, with the remote suffix moved to location', () => {
    const experience = selection.sections.find((s) => s.title === 'Experience')!;
    expect(experience.groups).toHaveLength(1);
    expect(experience.groups[0].heading).toEqual({
      organisation: 'Engine Co',
      location: 'Remote',
      role: 'Programmer',
      period: '1842 – 1843',
    });
    expect(experience.groups[0].entries.map((e) => e.source)).toEqual([
      'featured-note',
      'unfeatured-note',
      'draft-idea',
    ]);
  });

  it('heads a titled project with its name, and lists an untitled one bare', () => {
    const projects = selection.sections.find((s) => s.title === 'Projects')!;
    // Bare list first, so the untitled tool is not read as Side Project's bullet.
    expect(projects.groups[0].heading).toBeUndefined();
    expect(projects.groups[0].entries.map((e) => e.source)).toEqual(['untitled-tool']);
    expect(projects.groups[1].heading).toEqual({ organisation: 'Side Project', location: '1843' });
  });

  it('labels a titled record by its title, unless the prose already opens with it', () => {
    const titled = buildCompleteSelection(
      {
        identity,
        affiliations: [engine],
        accomplishments: [
          record({ id: 'named', affiliationId: 'engine-co', affiliation: engine, title: 'Note G', metric: 'x' }),
          record({ id: 'opens', affiliationId: 'engine-co', affiliation: engine, title: 'Note G', metric: 'x', statement: 'Note G computes Bernoulli numbers.' }),
        ],
        drafts: [],
      },
      SITE,
    );
    const entries = titled.sections[0].groups[0].entries;
    expect(entries.find((e) => e.source === 'named')?.label).toBe('Note G');
    expect(entries.find((e) => e.source === 'opens')?.label).toBeUndefined();
  });

  it('puts education under Education, with an open period read as Present', () => {
    const education = selection.sections.find((s) => s.title === 'Education')!;
    expect(education.groups[0].heading?.period).toBe('1830 – Present');
    expect(education.groups[0].entries.map((e) => e.source)).toEqual(['coursework']);
  });

  it('states the availability in the summary', () => {
    expect(selection.summary).toBe(
      'I write programs and prove they are correct. Available for Contractor work — remote, 9am–5pm London time.',
    );
  });

  it('builds a Selection the template accepts from the real Corpus', () => {
    const corpus = getCorpus();
    const real = buildCompleteSelection(corpus, SITE);

    expect(() => renderSelectionToTex(real)).not.toThrow();
    const cited = sources(real).filter((source) => source !== 'identity');
    expect(cited.length).toBe(corpus.accomplishments.length + corpus.drafts.length);
  });
});
