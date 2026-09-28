import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { CORPUS_JSON_VERSION, toCorpusJson } from './export';
import { loadCorpus } from './index';

const wellFormed = fileURLToPath(new URL('./__fixtures__/well-formed', import.meta.url));

describe('toCorpusJson', () => {
  const corpus = loadCorpus(wellFormed);
  const json = toCorpusJson(corpus);

  it('carries a version for the consumer in the other repository', () => {
    expect(json.version).toBe(CORPUS_JSON_VERSION);
  });

  it('exports records only, never a draft', () => {
    expect(json.accomplishments.map((a) => a.id).sort()).toEqual(
      corpus.accomplishments.map((a) => a.id).sort(),
    );
    for (const draft of corpus.drafts) {
      expect(json.accomplishments.some((a) => a.id === draft.id)).toBe(false);
    }
    expect(json.accomplishments.every((a) => a.metric.length > 0)).toBe(true);
  });

  it('references Affiliations by id instead of nesting them', () => {
    for (const a of json.accomplishments) {
      expect(a).not.toHaveProperty('affiliation');
      if (a.affiliationId) {
        expect(json.affiliations.some((f) => f.id === a.affiliationId)).toBe(true);
      }
    }
  });

  it('leaves the project image out of the contract (it is site presentation)', () => {
    expect(corpus.accomplishments.some((a) => a.image)).toBe(true);
    for (const a of json.accomplishments) {
      expect(a).not.toHaveProperty('image');
    }
  });

  it('survives a JSON round trip unchanged', () => {
    expect(JSON.parse(JSON.stringify(json))).toEqual(json);
  });
});
