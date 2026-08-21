import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CorpusError, loadCorpus } from './index';

function fixture(name: string): string {
  return fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url));
}

describe('loadCorpus', () => {
  describe('a well-formed Corpus', () => {
    const corpus = loadCorpus(fixture('well-formed'));

    it('parses every Affiliation into a typed record keyed by a stable id', () => {
      const acme = corpus.affiliations.find((a) => a.id === 'acme-corp');
      expect(acme).toEqual({
        id: 'acme-corp',
        organisation: 'Acme Corp',
        role: 'Senior Software Engineer',
        period: { start: '2022-01', end: '2024-03' },
        stack: ['TypeScript', 'Next.js', 'PostgreSQL'],
      });
      expect(corpus.affiliations).toHaveLength(2);
    });

    it('exposes the prose body of an Accomplishment as its statement', () => {
      const caching = corpus.accomplishments.find((a) => a.id === 'caching-layer');
      expect(caching?.statement).toContain('cutting p95 latency from 800ms to 120ms');
      expect(caching?.kind).toBe('engineering');
      expect(caching?.metric).toBe('p95 latency 800ms to 120ms');
    });

    it('resolves an Accomplishment reference to its Affiliation object', () => {
      const caching = corpus.accomplishments.find((a) => a.id === 'caching-layer');
      expect(caching?.affiliationId).toBe('acme-corp');
      expect(caching?.affiliation?.organisation).toBe('Acme Corp');
    });

    it('reads the display title when one is recorded, and leaves it absent otherwise', () => {
      const project = corpus.accomplishments.find((a) => a.id === 'side-project');
      expect(project?.title).toBe('Open Toolkit');
      const caching = corpus.accomplishments.find((a) => a.id === 'caching-layer');
      expect(caching?.title).toBeUndefined();
    });

    it('loads an Accomplishment that has no Affiliation', () => {
      const talk = corpus.accomplishments.find((a) => a.id === 'react-talk');
      expect(talk).toBeDefined();
      expect(talk?.affiliationId).toBeUndefined();
      expect(talk?.affiliation).toBeUndefined();
    });
  });

  describe('drafts', () => {
    const corpus = loadCorpus(fixture('well-formed'));

    it('excludes Accomplishments without a Metric from the default list', () => {
      const ids = corpus.accomplishments.map((a) => a.id);
      expect(ids).not.toContain('draft-idea');
    });

    it('makes drafts retrievable on request', () => {
      const ids = corpus.drafts.map((a) => a.id);
      expect(ids).toEqual(['draft-idea']);
      expect(corpus.drafts[0].isDraft).toBe(true);
      expect(corpus.drafts[0].metric).toBeUndefined();
    });

    it('marks records as not drafts', () => {
      expect(corpus.accomplishments.every((a) => a.isDraft === false)).toBe(true);
    });
  });

  describe('queries', () => {
    const corpus = loadCorpus(fixture('well-formed'));

    it('returns exactly the Featured subset', () => {
      const ids = corpus.featured.map((a) => a.id).sort();
      expect(ids).toEqual(['caching-layer', 'react-talk']);
    });

    it('returns records matching a kind, excluding drafts', () => {
      const ids = corpus.byKind('engineering').map((a) => a.id).sort();
      expect(ids).toEqual(['api-migration', 'caching-layer']);
      expect(corpus.byKind('talk').map((a) => a.id)).toEqual(['react-talk']);
    });

    it('includes drafts of a kind only when the caller opts in', () => {
      const ids = corpus
        .byKind('engineering', { includeDrafts: true })
        .map((a) => a.id)
        .sort();
      expect(ids).toEqual(['api-migration', 'caching-layer', 'draft-idea']);
    });

    it('includes drafts of an Affiliation only when the caller opts in', () => {
      const ids = corpus
        .byAffiliation('acme-corp', { includeDrafts: true })
        .map((a) => a.id)
        .sort();
      expect(ids).toEqual(['api-migration', 'caching-layer', 'draft-idea']);
    });

    it('returns records belonging to an Affiliation, excluding drafts', () => {
      const ids = corpus.byAffiliation('acme-corp').map((a) => a.id).sort();
      expect(ids).toEqual(['api-migration', 'caching-layer']);
    });

    it('returns an empty array for an Affiliation with no records', () => {
      expect(corpus.byAffiliation('does-not-exist')).toEqual([]);
    });
  });

  describe('validation failures halt loudly', () => {
    it('rejects an Accomplishment missing a required field', () => {
      expect(() => loadCorpus(fixture('missing-field'))).toThrow(CorpusError);
      expect(() => loadCorpus(fixture('missing-field'))).toThrow(/no-kind/);
    });

    it('rejects an Affiliation missing a required field', () => {
      expect(() => loadCorpus(fixture('missing-affiliation-field'))).toThrow(
        CorpusError,
      );
      expect(() => loadCorpus(fixture('missing-affiliation-field'))).toThrow(
        /Affiliation "no-role" .* role/,
      );
    });

    it('rejects an Accomplishment referencing a nonexistent Affiliation', () => {
      expect(() => loadCorpus(fixture('dangling-affiliation'))).toThrow(CorpusError);
      expect(() => loadCorpus(fixture('dangling-affiliation'))).toThrow(/nonexistent-org/);
    });
  });

  describe('Identity', () => {
    it('loads the Identity from content/identity.md, bio from the body', () => {
      const corpus = loadCorpus(fixture('with-identity'));
      expect(corpus.identity).toEqual({
        name: 'Ada Lovelace',
        initials: 'AL',
        role: ['Software Engineer', 'Mathematician'],
        location: 'London, United Kingdom',
        headline: 'Building provable systems.',
        bookingUrl: 'https://cal.com/ada',
        social: {
          github: 'https://github.com/ada',
          linkedin: 'https://linkedin.com/in/ada',
          email: 'ada@example.com',
        },
        bio: 'I write programs and prove they are correct.',
      });
    });

    it('treats a missing identity.md as a legitimate absent Identity', () => {
      const corpus = loadCorpus(fixture('well-formed'));
      expect(corpus.identity).toBeUndefined();
    });

    it('rejects an Identity missing a required field', () => {
      expect(() => loadCorpus(fixture('identity-malformed'))).toThrow(CorpusError);
      expect(() => loadCorpus(fixture('identity-malformed'))).toThrow(/name/);
    });

    it('rejects an Identity with an empty bio', () => {
      expect(() => loadCorpus(fixture('identity-empty-body'))).toThrow(CorpusError);
      expect(() => loadCorpus(fixture('identity-empty-body'))).toThrow(/bio/);
    });
  });

  describe('an Affiliation without a period', () => {
    it('loads with its period absent rather than being rejected', () => {
      const corpus = loadCorpus(fixture('with-identity'));
      const club = corpus.affiliations.find((a) => a.id === 'open-club');
      expect(club).toEqual({
        id: 'open-club',
        organisation: 'Analytical Society',
        role: 'Founding member',
        stack: ['Difference Engine'],
      });
      expect(club?.period).toBeUndefined();
    });
  });

  describe('an empty Corpus', () => {
    it('is a legitimate state rather than a crash', () => {
      const corpus = loadCorpus(fixture('empty'));
      expect(corpus.affiliations).toEqual([]);
      expect(corpus.accomplishments).toEqual([]);
      expect(corpus.drafts).toEqual([]);
      expect(corpus.featured).toEqual([]);
      expect(corpus.byKind('engineering')).toEqual([]);
    });

    it('treats a missing content directory as empty', () => {
      const corpus = loadCorpus(fixture('does-not-exist-at-all'));
      expect(corpus.affiliations).toEqual([]);
      expect(corpus.accomplishments).toEqual([]);
    });
  });
});
