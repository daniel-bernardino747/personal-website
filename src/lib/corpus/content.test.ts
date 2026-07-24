import { describe, expect, it } from 'vitest';

import { loadCorpus } from './index';

/**
 * Loads the real `content/` Corpus — not a fixture — through the loader and
 * asserts it validates. This is the guard the `capture` skill runs after writing
 * a file (`npm test -- content`): a `CorpusError` here means authored content has
 * a malformed frontmatter field or a dangling Affiliation reference, the same
 * failure that would halt a production build (spec story 34). It fails only on
 * genuine corruption — drafts and an Accomplishment-free Corpus are legitimate.
 */
describe('the authored content/ Corpus', () => {
  it('loads cleanly through the loader', () => {
    const corpus = loadCorpus();

    // Every Accomplishment resolves to an Affiliation that exists, or to none —
    // a surviving load already proves references aren't dangling, but assert the
    // invariant explicitly so a future loader change can't quietly drop it.
    for (const accomplishment of [...corpus.accomplishments, ...corpus.drafts]) {
      if (accomplishment.affiliationId !== undefined) {
        expect(accomplishment.affiliation).toBeDefined();
      }
    }
  });
});
