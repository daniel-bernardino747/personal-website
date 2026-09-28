import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { careerRepo, corpusDir, generatedDir } from './location';
import { getIdentity } from './site';

/**
 * The Corpus lives in the `career` checkout (ADR-0013). These pin how its
 * location resolves, and that a missing checkout halts the build naming the
 * variable that fixes it rather than rendering a site with no one on it.
 */
describe('where the Corpus lives', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the sibling career checkout', () => {
    vi.stubEnv('CORPUS_REPO', undefined);
    vi.stubEnv('CORPUS_DIR', undefined);
    expect(careerRepo()).toBe(resolve(process.cwd(), '..', 'career'));
    expect(corpusDir()).toBe(join(careerRepo(), 'corpus'));
    expect(generatedDir()).toBe(join(careerRepo(), 'generated'));
  });

  it('follows CORPUS_REPO', () => {
    vi.stubEnv('CORPUS_REPO', '/elsewhere/career');
    vi.stubEnv('CORPUS_DIR', undefined);
    expect(corpusDir()).toBe(join(resolve('/elsewhere/career'), 'corpus'));
  });

  it('lets CORPUS_DIR, set only by the deployed image, win', () => {
    vi.stubEnv('CORPUS_REPO', '/elsewhere/career');
    vi.stubEnv('CORPUS_DIR', '/app/content');
    expect(corpusDir()).toBe(resolve('/app/content'));
  });

  it('halts on a missing checkout with a message naming CORPUS_REPO', () => {
    vi.stubEnv('CORPUS_REPO', join(process.cwd(), 'no-such-career-checkout'));
    vi.stubEnv('CORPUS_DIR', undefined);
    expect(() => getIdentity()).toThrow(/CORPUS_REPO/);
  });
});
