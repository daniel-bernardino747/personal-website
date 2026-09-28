import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { getIdentity } from './site';
import { CorpusError, fromSiteJson, readCorpus } from './source';

const FIXTURE = fileURLToPath(new URL('./__fixtures__/site.json', import.meta.url));
const fixture = () => JSON.parse(readFileSync(FIXTURE, 'utf8'));

/**
 * The site reads the Corpus only through `site:json` (ADR-0013). The fixture is
 * `career`'s own `toSiteJson` output over its well-formed fixture, plus a draft
 * project.
 */
describe('reading site:json', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds the Corpus the pages query', () => {
    const corpus = readCorpus(FIXTURE);
    expect(corpus.identity?.name).toBeDefined();
    expect(corpus.featured.map((a) => a.id).sort()).toEqual(['caching-layer', 'react-talk']);
    expect(corpus.byKind('project').map((a) => a.id)).toEqual(['side-project']);
    expect(corpus.byKind('project', { includeDrafts: true }).map((a) => a.id).sort()).toEqual([
      'side-project',
      'unshipped-idea',
    ]);
  });

  it('resolves each Affiliation from the ids it carries', () => {
    const corpus = readCorpus(FIXTURE);
    for (const a of [...corpus.accomplishments, ...corpus.drafts]) {
      if (a.affiliationId) expect(a.affiliation?.id).toBe(a.affiliationId);
    }
  });

  it('refuses another contract version before reading anything', () => {
    expect(() => fromSiteJson({ ...fixture(), version: 2 })).toThrow(/version 2/);
  });

  it('refuses a record that does not match the contract', () => {
    const json = fixture();
    delete json.accomplishments[0].statement;
    expect(() => fromSiteJson(json)).toThrow(CorpusError);
  });

  it('refuses a reference to an Affiliation it does not carry', () => {
    const json = fixture();
    json.accomplishments[0].affiliationId = 'nowhere';
    expect(() => fromSiteJson(json)).toThrow(/nowhere/);
  });

  it('halts on a missing site.json with a message naming how to fetch it', () => {
    vi.stubEnv('SITE_JSON', join(process.cwd(), 'no-such-dir', 'site.json'));
    expect(() => getIdentity()).toThrow(/corpus:fetch.*CORPUS_REPO/);
  });
});
