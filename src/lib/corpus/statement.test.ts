import { describe, expect, it } from 'vitest';

import { displayTitle, displayYear, parseStatement } from './statement';
import type { Accomplishment } from './schema';

function accomplishment(overrides: Partial<Accomplishment> = {}): Accomplishment {
  return {
    id: 'example',
    date: '2026-07',
    kind: 'project',
    statement: 'Did a thing.',
    featured: false,
    isDraft: true,
    ...overrides,
  };
}

describe('parseStatement', () => {
  it('splits a trailing "Built with" sentence off the prose', () => {
    const { prose, tech } = parseStatement(
      'A Kanban system for distributing tasks across teams.\n\nBuilt with Next.js, Nest.js, Prisma.',
    );
    expect(prose).toBe('A Kanban system for distributing tasks across teams.');
    expect(tech).toEqual(['Next.js', 'Nest.js', 'Prisma']);
  });

  it('splits the final item written with "and" rather than a comma', () => {
    const { tech } = parseStatement(
      'A thing. Built with Next.js, Prisma, Jest and TypeScript.',
    );
    expect(tech).toEqual(['Next.js', 'Prisma', 'Jest', 'TypeScript']);
  });

  it('reads a live URL and keeps it out of the stack', () => {
    const { tech, liveUrl } = parseStatement(
      'A URL shortener. Built with React, axios. Live: https://linkr-f.vercel.app',
    );
    expect(tech).toEqual(['React', 'axios']);
    expect(liveUrl).toBe('https://linkr-f.vercel.app/');
  });

  it('reads a repo URL and keeps it out of the stack', () => {
    const { prose, tech, repoUrl } = parseStatement(
      'A downloader. Built with Python, pytest. Repo: https://github.com/acme/thing',
    );
    expect(prose).toBe('A downloader.');
    expect(tech).toEqual(['Python', 'pytest']);
    expect(repoUrl).toBe('https://github.com/acme/thing');
  });

  it('reads both links regardless of the order they are written in', () => {
    const written = [
      'A thing. Built with React. Live: https://thing.dev Repo: https://github.com/acme/thing',
      'A thing. Built with React. Repo: https://github.com/acme/thing Live: https://thing.dev',
    ];
    for (const statement of written) {
      const { prose, tech, liveUrl, repoUrl } = parseStatement(statement);
      expect(prose).toBe('A thing.');
      expect(tech).toEqual(['React']);
      expect(liveUrl).toBe('https://thing.dev/');
      expect(repoUrl).toBe('https://github.com/acme/thing');
    }
  });

  it('reads a link from a statement that records no stack', () => {
    const { prose, tech, repoUrl } = parseStatement(
      'A concept that reached the design stage.\n\nRepo: https://github.com/acme/thing',
    );
    expect(prose).toBe('A concept that reached the design stage.');
    expect(tech).toEqual([]);
    expect(repoUrl).toBe('https://github.com/acme/thing');
  });

  it('drops a non-http URL rather than rendering it as a link', () => {
    const { liveUrl } = parseStatement(
      'A thing. Built with React. Live: javascript:alert(1)',
    );
    expect(liveUrl).toBeUndefined();
  });

  it('keeps versioned and parenthesised names intact', () => {
    const { tech } = parseStatement(
      'A thing. Built with Next.js 15/16, React 19, AWS SDK (S3), docker-compose.',
    );
    expect(tech).toEqual([
      'Next.js 15/16',
      'React 19',
      'AWS SDK (S3)',
      'docker-compose',
    ]);
  });

  it('ignores an earlier "Built with" and honours the closing one', () => {
    const { prose, tech } = parseStatement(
      'A tool built with care over two years. Built with Python, pytest.',
    );
    expect(prose).toBe('A tool built with care over two years.');
    expect(tech).toEqual(['Python', 'pytest']);
  });

  it('returns the whole statement as prose when the convention is absent', () => {
    const statement =
      'PetriCar reached the design stage — Node.js, Prisma, Clean Architecture — but was never built out.';
    expect(parseStatement(statement)).toEqual({ prose: statement, tech: [] });
  });

  it('does not truncate prose when "Built with" closes nothing', () => {
    const statement = 'A thing I was proud to have Built with ';
    expect(parseStatement(statement).prose).toBe(statement.trim());
  });
});

describe('displayTitle', () => {
  it('prefers the recorded title', () => {
    expect(
      displayTitle(
        accomplishment({
          title: 'BaixarMusica',
          affiliation: {
            id: 'acme',
            organisation: 'Acme',
            role: 'Engineer',
            stack: [],
          },
        }),
      ),
    ).toBe('BaixarMusica');
  });

  it('falls back to the Affiliation when no title was recorded', () => {
    expect(
      displayTitle(
        accomplishment({
          affiliation: {
            id: 'acme',
            organisation: 'Acme',
            role: 'Engineer',
            stack: [],
          },
        }),
      ),
    ).toBe('Acme');
  });

  it('returns nothing rather than inventing a name from the id', () => {
    expect(displayTitle(accomplishment())).toBeUndefined();
  });
});

describe('displayYear', () => {
  it('reads the year off a full or partial date', () => {
    expect(displayYear(accomplishment({ date: '2026-07-24' }))).toBe('2026');
    expect(displayYear(accomplishment({ date: '2023' }))).toBe('2023');
  });
});
