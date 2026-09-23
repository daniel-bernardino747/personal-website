import { describe, expect, it } from 'vitest';

import { careerTimeline, displayPeriod } from './career';
import type { Accomplishment, Affiliation } from './schema';

function affiliation(overrides: Partial<Affiliation> = {}): Affiliation {
  return {
    id: 'acme',
    organisation: 'Acme',
    role: 'Engineer',
    stack: [],
    ...overrides,
  };
}

function accomplishment(overrides: Partial<Accomplishment> = {}): Accomplishment {
  return {
    id: 'example',
    affiliationId: 'acme',
    date: '2024-01',
    kind: 'engineering',
    statement: 'Did a thing.',
    featured: true,
    isDraft: false,
    metric: 'Latency −50%',
    ...overrides,
  };
}

describe('careerTimeline', () => {
  it('orders Affiliations oldest first, undated last', () => {
    const stops = careerTimeline(
      [
        affiliation({ id: 'b', period: { start: '2025' } }),
        affiliation({ id: 'none' }),
        affiliation({ id: 'a', period: { start: '2020', end: '2022' } }),
      ],
      [],
    );
    expect(stops.map((s) => s.affiliation.id)).toEqual(['a', 'b', 'none']);
  });

  it('marks an open-ended period as current', () => {
    const [past, now] = careerTimeline(
      [
        affiliation({ id: 'past', period: { start: '2020', end: '2022' } }),
        affiliation({ id: 'now', period: { start: '2025' } }),
      ],
      [],
    );
    expect(past.isCurrent).toBe(false);
    expect(now.isCurrent).toBe(true);
  });

  it('picks the shortest Featured Metric and keeps only its lead clause', () => {
    const [stop] = careerTimeline(
      [affiliation()],
      [
        accomplishment({ id: 'long', metric: 'A much longer measured claim here' }),
        accomplishment({ id: 'short', metric: 'Load 7s → 1.5s; memory −30%' }),
      ],
    );
    expect(stop.highlight).toBe('Load 7s → 1.5s');
  });

  it('ignores unfeatured, unmeasured and other-Affiliation records', () => {
    const [stop] = careerTimeline(
      [affiliation()],
      [
        accomplishment({ featured: false }),
        accomplishment({ metric: undefined, isDraft: true }),
        accomplishment({ affiliationId: 'elsewhere' }),
      ],
    );
    expect(stop.highlight).toBeUndefined();
  });
});

describe('displayPeriod', () => {
  it('abbreviates the end year within a century', () => {
    expect(displayPeriod({ start: '2020', end: '2022' })).toBe('2020–22');
  });

  it('reads an open period as running to now', () => {
    expect(displayPeriod({ start: '2025-03' })).toBe('2025–now');
  });

  it('collapses a single-year period and tolerates an absent one', () => {
    expect(displayPeriod({ start: '2023', end: '2023' })).toBe('2023');
    expect(displayPeriod(undefined)).toBe('');
  });
});
