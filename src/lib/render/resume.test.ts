import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import {
  isTectonicAvailable,
  RenderError,
  renderSelectionToPdf,
  renderSelectionToTex,
  SELECTION_VERSION,
} from './resume';

import sampleSelection from './__fixtures__/sample-selection.json';

/**
 * The render pipeline turns a Selection — structured data the model emits — into
 * a PDF through a fixed LaTeX template ([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md)).
 * These tests fix the pipeline's external behaviour: what a valid Selection
 * produces, and that a malformed one fails loudly rather than yielding a subtly
 * different document. They say nothing about how the `.tex` is assembled.
 */
describe('renderSelectionToTex', () => {
  it('renders a valid Selection into a LaTeX document carrying its content', () => {
    const tex = renderSelectionToTex(sampleSelection);

    expect(tex).toContain('\\documentclass');
    expect(tex).toContain('\\begin{document}');
    expect(tex).toContain('\\end{document}');
    // Header identity and every section title and entry reach the document.
    expect(tex).toContain('Ada Fixture');
    expect(tex).toContain('Experience');
    expect(tex).toContain('Talks');
    expect(tex).toContain('cutting p95 latency from 800ms to 120ms');
  });

  it('keeps the source reference out of the rendered document — it is an audit field, not resume content', () => {
    // Per ADR-0004 the Selection is the audit surface: `source` ties each entry
    // back to its Corpus file for review, but a résumé must not print internal ids.
    const tex = renderSelectionToTex(sampleSelection);
    expect(tex).not.toContain('caching-layer');
    expect(tex).not.toContain('api-migration');
  });

  it('escapes LaTeX special characters so authored prose cannot break or malform the document', () => {
    const withSpecials = {
      ...sampleSelection,
      sections: [
        {
          title: 'R&D',
          entries: [
            {
              source: 'specials',
              text: 'Cut cost by 50% & saved $3k; tuned a_b tests #1 with ~10% lift ^2 {scope}.',
            },
          ],
        },
      ],
    };

    const tex = renderSelectionToTex(withSpecials);

    // The escaped forms are present…
    expect(tex).toContain('50\\%');
    expect(tex).toContain('\\&');
    expect(tex).toContain('\\$3k');
    expect(tex).toContain('a\\_b');
    expect(tex).toContain('\\#1');
    // …and no raw special survives in the body that would derail the compile.
    const body = tex.slice(tex.indexOf('\\begin{document}'));
    expect(body).not.toMatch(/[^\\]&/); // no unescaped ampersand
    expect(body).not.toMatch(/[^\\]%[^\s]/); // no unescaped percent starting a comment
  });
});

describe('a Selection that departs from the expected shape', () => {
  it('throws rather than rendering when a required field is missing', () => {
    const { header, ...noHeader } = sampleSelection;
    expect(() => renderSelectionToTex(noHeader)).toThrow(RenderError);
  });

  it('throws when the Selection has no sections', () => {
    expect(() =>
      renderSelectionToTex({ ...sampleSelection, sections: [] }),
    ).toThrow(RenderError);
  });

  it('throws when an entry carries no source reference', () => {
    const noSource = {
      ...sampleSelection,
      sections: [
        { title: 'Experience', entries: [{ text: 'Did a thing.' }] },
      ],
    };
    expect(() => renderSelectionToTex(noSource)).toThrow(RenderError);
  });

  it('throws when the Selection version does not match the template version', () => {
    expect(() =>
      renderSelectionToTex({ ...sampleSelection, version: SELECTION_VERSION + 1 }),
    ).toThrow(RenderError);
  });

  it('throws on an unknown top-level field, so a drifting generator is caught', () => {
    expect(() =>
      renderSelectionToTex({ ...sampleSelection, extraneous: true }),
    ).toThrow(RenderError);
  });
});

/**
 * The single smoke check the spec asks for: a fixture Selection passes through
 * the template and Tectonic and yields a non-trivial PDF. Typography is not
 * asserted — the failure this guards against is drift between the Selection shape
 * and the template's expectations. Skipped when Tectonic is not installed so the
 * suite stays green on machines without it; CI/dev must install it (see the
 * ticket prerequisite).
 */
describe('the render pipeline', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'resume-render-'));
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it.skipIf(!isTectonicAvailable())(
    'renders a fixture Selection to a non-trivial PDF via Tectonic',
    () => {
      const { pdfPath } = renderSelectionToPdf(sampleSelection, {
        outDir,
        name: 'smoke',
      });

      const bytes = statSync(pdfPath).size;
      expect(bytes).toBeGreaterThan(1000);
      // A PDF starts with the "%PDF" magic — proves we produced a real document,
      // not an empty or truncated file.
      const head = readFileSync(pdfPath).subarray(0, 4).toString('latin1');
      expect(head).toBe('%PDF');
    },
    120_000,
  );
});
