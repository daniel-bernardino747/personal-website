import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { careerRepo, corpusDir, generatedDir } from './location';

/** The `career` checkout is found by path (ADR-0013), like `prospect-me` does. */
describe('where the career checkout is', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the sibling directory', () => {
    vi.stubEnv('CORPUS_REPO', undefined);
    expect(careerRepo()).toBe(resolve(process.cwd(), '..', 'career'));
    expect(corpusDir()).toBe(join(careerRepo(), 'corpus'));
    expect(generatedDir()).toBe(join(careerRepo(), 'generated'));
  });

  it('follows CORPUS_REPO', () => {
    vi.stubEnv('CORPUS_REPO', '/elsewhere/career');
    expect(corpusDir()).toBe(join(resolve('/elsewhere/career'), 'corpus'));
  });
});
