import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadCorpus } from './loader';

/**
 * `content/` is gitignored, so `content.example/` is the only Corpus a fresh
 * clone gets — the README tells a newcomer to copy it and build. That makes the
 * template part of the contract: if the schema gains a required field and the
 * example isn't updated, onboarding breaks on the first `npm run build`. This
 * test fails first instead.
 */
describe('content.example', () => {
  const corpus = loadCorpus(join(process.cwd(), 'content.example'));

  it('carries the Identity the site cannot render without', () => {
    expect(corpus.identity?.name).toBe('Ada Lovelace');
    expect(corpus.identity?.bio).not.toBe('');
  });

  it('resolves its Accomplishment against the Affiliation it references', () => {
    const [project] = corpus.byKind('project');
    expect(project.affiliation?.organisation).toBe('Example Corp');
  });

  it('demonstrates the closing conventions the project card reads', () => {
    const [project] = corpus.byKind('project');
    expect(project.statement).toMatch(/Built with .+\. Live: https:\/\/\S+ Repo: https:\/\/\S+$/);
  });
});
