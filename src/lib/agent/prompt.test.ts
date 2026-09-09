import { describe, expect, it } from 'vitest';

import { buildSystemPrompt } from './prompt';
import { getCorpus } from '@/lib/corpus/site';

/**
 * The system prompt is the only thing standing between a language model and
 * ADR-0003. These tests check the two properties that matter — that every Metric
 * reaches the model as the Corpus's exact string, and that non-Featured records
 * are absent rather than merely discouraged.
 *
 * What they cannot check is whether the model obeys. That is what the acceptance
 * criteria in the ticket are for, run against the real API.
 */
describe('the agent system prompt', () => {
  const prompt = buildSystemPrompt();
  const corpus = getCorpus();

  it('quotes every Featured Metric verbatim', () => {
    const withMetrics = corpus.featured.filter((record) => record.metric);

    expect(withMetrics.length).toBeGreaterThan(0);
    for (const record of withMetrics) {
      // Byte for byte. A metric that has been reformatted on the way in cannot
      // be quoted correctly on the way out.
      expect(prompt).toContain(record.metric!);
    }
  });

  it('carries no Accomplishment that is not Featured', () => {
    const featuredIds = new Set(corpus.featured.map((record) => record.id));
    const others = [...corpus.accomplishments, ...corpus.drafts].filter(
      (record) => !featuredIds.has(record.id),
    );

    expect(others.length).toBeGreaterThan(0);
    for (const record of others) {
      if (record.metric) {
        expect(
          prompt.includes(record.metric),
          `metric of non-featured ${record.id} is in the prompt`,
        ).toBe(false);
      }
      // The statement is the record's substance; its first sentence is enough to
      // catch a leak without matching on incidental shared words.
      const opening = record.statement.slice(0, 60);
      expect(
        prompt.includes(opening),
        `statement of non-featured ${record.id} is in the prompt`,
      ).toBe(false);
    }
  });

  it('instructs the model to refuse rather than fill gaps', () => {
    expect(prompt).toContain("I don't have that recorded");
  });

  it('is stable across calls, so it can be cached', () => {
    // A timestamp or request id slipped into the prompt would invalidate the
    // cache prefix on every request and quietly multiply the bill.
    expect(buildSystemPrompt()).toBe(prompt);
  });
});
