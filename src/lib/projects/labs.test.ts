import { describe, expect, it } from 'vitest';

import type { Accomplishment } from '../corpus/schema';
import { isLabsDemo, splitLabs } from './labs';

const project = (id: string, statement: string, date = '2026-09'): Accomplishment => ({
  id,
  date,
  kind: 'project',
  statement,
  featured: false,
  isDraft: true,
});

describe('isLabsDemo', () => {
  it('knows a project whose Live link is served by Labs', () => {
    expect(
      isLabsDemo(project('a', 'Did a thing. Built with Next.js. Live: https://labs.teamdbsolutions.com/demo/a')),
    ).toBe(true);
  });

  it('does not take another host, a lookalike, or a repo link for Labs', () => {
    expect(isLabsDemo(project('b', 'Did a thing. Live: https://www.teamdbsolutions.com'))).toBe(false);
    expect(isLabsDemo(project('c', 'Did a thing. Live: https://evil-labs.teamdbsolutions.com.attacker.net/x'))).toBe(
      false,
    );
    expect(isLabsDemo(project('d', 'Did a thing. Repo: https://labs.teamdbsolutions.com/demo/d'))).toBe(false);
    expect(isLabsDemo(project('e', 'Did a thing.'))).toBe(false);
  });
});

describe('splitLabs', () => {
  it('puts each project in exactly one place, Labs demos newest first', () => {
    const labsOld = project('old', 'X. Live: https://labs.teamdbsolutions.com/demo/old', '2026-08');
    const other = project('other', 'Y. Live: https://example.com');
    const labsNew = project('new', 'Z. Live: https://labs.teamdbsolutions.com/demo/new', '2026-09');
    const { labs, rest } = splitLabs([labsOld, other, labsNew]);
    expect(labs.map((p) => p.id)).toEqual(['new', 'old']);
    expect(rest.map((p) => p.id)).toEqual(['other']);
  });
});
