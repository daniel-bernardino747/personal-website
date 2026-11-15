import { describe, expect, it } from 'vitest';

import type { Accomplishment } from '../corpus/schema';
import { AGENT_IDS, splitAgents } from './agents';

const project = (id: string): Accomplishment => ({
  id,
  date: '2026',
  kind: 'project',
  statement: `${id}.`,
  featured: false,
  isDraft: true,
});

describe('splitAgents', () => {
  it('moves every registered project to the Agents section and keeps the rest in order', () => {
    const { agents, rest } = splitAgents([project('a'), project(AGENT_IDS[0]), project('b')]);
    expect(agents.map((p) => p.id)).toEqual([AGENT_IDS[0]]);
    expect(rest.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('shows nothing for a registered id the Corpus does not carry', () => {
    expect(splitAgents([project('a')]).agents).toEqual([]);
  });
});
