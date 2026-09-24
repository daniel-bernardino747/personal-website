import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { isTectonicAvailable, RenderError } from './document';
import { LETTER_VERSION, renderLetterToPdf, renderLetterToTex } from './letter';

import sampleLetter from './__fixtures__/sample-letter.json';

/**
 * The cover letter follows the résumé's contract (ADR-0004): structured data in,
 * a fixed template out, and a malformed Letter refused rather than rendered. The
 * one rule of its own (ADR-0010) is that a claim about Daniel's motives must be
 * backed by his recorded words.
 */
describe('renderLetterToTex', () => {
  it('renders the header, recipient, salutation, every paragraph and the signature', () => {
    const tex = renderLetterToTex(sampleLetter);

    expect(tex).toContain('\\begin{document}');
    expect(tex).toContain('{\\LARGE \\textbf{Ada Fixture}}');
    expect(tex).toContain('Hiring Team \\\\\nAcme Corp \\\\\nBerlin');
    expect(tex).toContain('\\hfill 23 September 2026');
    expect(tex).toContain('Dear Acme hiring team,');
    expect(tex).toContain('cutting p95 latency from 800ms to 120ms');
    expect(tex).toContain('Kind regards,');
    expect(tex.trimEnd().endsWith('Ada Fixture\n\n\\end{document}')).toBe(true);
  });

  it('keeps sources and statedByDaniel out of the document — they are audit fields', () => {
    const tex = renderLetterToTex(sampleLetter);

    expect(tex).not.toContain('caching-layer');
    expect(tex).not.toContain('I like building the thing other teams depend on.');
  });

  it('escapes authored prose like the résumé does', () => {
    const tex = renderLetterToTex({
      ...sampleLetter,
      salutation: 'Dear R&D team —',
    });

    expect(tex).toContain('Dear R\\&D team ---');
  });
});

describe('a Letter that departs from the expected shape', () => {
  it("throws when a paragraph cites 'daniel' but nothing Daniel said is recorded", () => {
    expect(() => renderLetterToTex({ ...sampleLetter, statedByDaniel: [] })).toThrow(
      RenderError,
    );
  });

  it('throws when a paragraph cites no source', () => {
    const paragraphs = [
      ...sampleLetter.paragraphs.slice(1),
      { text: 'Unattributed claim.', sources: [] },
    ];
    expect(() => renderLetterToTex({ ...sampleLetter, paragraphs })).toThrow(RenderError);
  });

  it('throws when the body is a single paragraph or runs past five', () => {
    const one = sampleLetter.paragraphs.slice(0, 1);
    const six = [...sampleLetter.paragraphs, ...sampleLetter.paragraphs];
    expect(() => renderLetterToTex({ ...sampleLetter, paragraphs: one })).toThrow(
      RenderError,
    );
    expect(() => renderLetterToTex({ ...sampleLetter, paragraphs: six })).toThrow(
      RenderError,
    );
  });

  it('throws when the version does not match the template version', () => {
    expect(() =>
      renderLetterToTex({ ...sampleLetter, version: LETTER_VERSION + 1 }),
    ).toThrow(RenderError);
  });

  it('throws on an unknown field', () => {
    expect(() => renderLetterToTex({ ...sampleLetter, extraneous: true })).toThrow(
      RenderError,
    );
  });
});

describe('the letter render pipeline', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'letter-render-'));
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it.skipIf(!isTectonicAvailable())(
    'renders a fixture Letter to a non-trivial PDF via Tectonic',
    () => {
      const { pdfPath } = renderLetterToPdf(sampleLetter, { outDir, name: 'smoke' });

      expect(statSync(pdfPath).size).toBeGreaterThan(1000);
      expect(readFileSync(pdfPath).subarray(0, 4).toString('latin1')).toBe('%PDF');
    },
    120_000,
  );
});
