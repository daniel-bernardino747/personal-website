import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

/**
 * The render pipeline: a Selection — structured data the generation skill emits —
 * becomes a PDF through a fixed, versioned LaTeX template. The model never writes
 * LaTeX ([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md)):
 * standardisation is structural, so a Selection that departs from the expected
 * shape fails to render here rather than producing a subtly different document.
 *
 * This module is deliberately self-contained — it depends on the Selection alone,
 * never on the Corpus loader — so it stays testable with a fixture Selection and
 * runnable from a plain Node script (see `scripts/render-resume.mjs`).
 */

/**
 * The template version. A Selection must declare the same number; a mismatch is
 * refused rather than rendered, so a Selection authored against an old template
 * cannot silently produce a malformed résumé. Bump this whenever the template's
 * expectations of the Selection change.
 */
export const SELECTION_VERSION = 1;

const linkSchema = z.strictObject({
  label: z.string().min(1),
  url: z.string().min(1),
});

/**
 * One résumé line: the model-compressed statement plus `source` — the id of the
 * Corpus file it came from. `source` is the audit trail ([ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)):
 * it ties every claim back to what Daniel actually wrote and is never printed on
 * the résumé itself. `detail` is an optional context line (organisation · role ·
 * period).
 */
const entrySchema = z.strictObject({
  source: z.string().min(1),
  text: z.string().min(1),
  detail: z.string().min(1).optional(),
});

const sectionSchema = z.strictObject({
  title: z.string().min(1),
  entries: z.array(entrySchema).min(1),
});

const headerSchema = z.strictObject({
  name: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  email: z.string().min(1),
  links: z.array(linkSchema).default([]),
});

/**
 * The whole contract between the model and the template. Strict throughout: an
 * unknown or missing field is rejected, which is the mechanism ADR-0004 relies on
 * — an output that departs from the format does not compile.
 */
export const selectionSchema = z.strictObject({
  version: z.literal(SELECTION_VERSION),
  language: z.enum(['en', 'pt']).default('en'),
  targetRole: z.string().min(1),
  header: headerSchema,
  summary: z.string().min(1).optional(),
  sections: z.array(sectionSchema).min(1),
});

export type Selection = z.infer<typeof selectionSchema>;

/** The paths a render produced. */
export interface RenderResult {
  texPath: string;
  pdfPath: string;
}

/**
 * Thrown when a Selection cannot be rendered — because it does not match the
 * schema, or because Tectonic is absent or failed. Distinct from the loader's
 * `CorpusError`: this concerns generated output, never the Corpus.
 */
export class RenderError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RenderError';
  }
}

/** babel's language name per Selection language, for correct hyphenation. */
const LANGUAGE_BABEL: Record<Selection['language'], string> = {
  en: 'english',
  pt: 'portuguese',
};

/** LaTeX's special characters, mapped to their escaped forms. */
const LATEX_ESCAPES: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  $: '\\$',
  '&': '\\&',
  '#': '\\#',
  '%': '\\%',
  _: '\\_',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}',
};

/**
 * Escape LaTeX special characters in authored prose. A single pass over the
 * original string — the replacements themselves contain braces and backslashes,
 * but those are never rescanned — so no character is double-escaped.
 */
function escapeLatex(text: string): string {
  return text.replace(/[\\{}$&#%_~^]/g, (char) => LATEX_ESCAPES[char]);
}

/**
 * Escape the characters that break a URL inside `\href`. Narrower than
 * `escapeLatex` because a URL is not prose: `%` and `#` are escaped, and a stray
 * backslash — which has no valid place in an http(s) URL and would otherwise
 * start a LaTeX control sequence — is rewritten to `/` rather than escaped. Every
 * other character is legal in a link target.
 */
function escapeUrl(url: string): string {
  return url.replace(/[%#\\]/g, (char) => (char === '\\' ? '/' : `\\${char}`));
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.') || '(selection)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

/** Validate arbitrary input against the Selection schema, or throw `RenderError`. */
function parseSelection(input: unknown): Selection {
  const result = selectionSchema.safeParse(input);
  if (!result.success) {
    throw new RenderError(
      `Selection does not match the expected shape — ${formatIssues(result.error)}`,
      { cause: result.error },
    );
  }
  return result.data;
}

/** Assemble the LaTeX document for a validated Selection. */
function buildTex(selection: Selection): string {
  const { header, language, summary, sections } = selection;
  const lines: string[] = [
    '\\documentclass[11pt,a4paper]{article}',
    `\\usepackage[${LANGUAGE_BABEL[language]}]{babel}`,
    '\\usepackage[margin=2cm]{geometry}',
    '\\usepackage{enumitem}',
    '\\usepackage[hidelinks]{hyperref}',
    '\\setlist[itemize]{leftmargin=1.2em,itemsep=2pt,topsep=2pt}',
    '\\renewcommand{\\familydefault}{\\sfdefault}',
    '\\pagestyle{empty}',
    '\\begin{document}',
    '\\begin{center}',
    `{\\LARGE \\textbf{${escapeLatex(header.name)}}}\\\\[2pt]`,
    `{\\large ${escapeLatex(header.role)}}\\\\[4pt]`,
  ];

  const contact = [escapeLatex(header.location), escapeLatex(header.email)];
  for (const link of header.links) {
    contact.push(`\\href{${escapeUrl(link.url)}}{${escapeLatex(link.label)}}`);
  }
  lines.push(contact.join(' \\quad '));
  lines.push('\\end{center}');

  if (summary !== undefined) {
    lines.push('\\vspace{6pt}');
    lines.push(escapeLatex(summary));
  }

  for (const section of sections) {
    lines.push(`\\section*{${escapeLatex(section.title)}}`);
    lines.push('\\begin{itemize}');
    for (const entry of section.entries) {
      if (entry.detail !== undefined) {
        lines.push(
          `\\item {\\small\\itshape ${escapeLatex(entry.detail)}}\\\\ ${escapeLatex(entry.text)}`,
        );
      } else {
        lines.push(`\\item ${escapeLatex(entry.text)}`);
      }
    }
    lines.push('\\end{itemize}');
  }

  lines.push('\\end{document}');
  return `${lines.join('\n')}\n`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'resume'
  );
}

/**
 * Render a Selection to a LaTeX document string. Throws `RenderError` if the
 * Selection does not match the schema — the point where a malformed Selection is
 * refused rather than turned into a broken document.
 */
export function renderSelectionToTex(input: unknown): string {
  return buildTex(parseSelection(input));
}

/** Whether the Tectonic binary is installed and callable. */
export function isTectonicAvailable(): boolean {
  try {
    execFileSync('tectonic', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Render a Selection to a PDF via Tectonic, writing both the `.tex` and the
 * `.pdf` into `outDir`. Validates the Selection first, so a malformed one fails
 * before any file is written. Throws `RenderError` when Tectonic is missing or
 * the compile fails.
 */
export function renderSelectionToPdf(
  input: unknown,
  options: { outDir: string; name?: string },
): RenderResult {
  const selection = parseSelection(input);
  const tex = buildTex(selection);
  const name = options.name ?? slugify(selection.targetRole);

  mkdirSync(options.outDir, { recursive: true });
  const texPath = join(options.outDir, `${name}.tex`);
  const pdfPath = join(options.outDir, `${name}.pdf`);
  writeFileSync(texPath, tex, 'utf8');

  if (!isTectonicAvailable()) {
    throw new RenderError(
      'Tectonic is not installed or not on PATH. Install it (e.g. `scoop install tectonic`) — it is a prerequisite for rendering.',
    );
  }

  try {
    execFileSync(
      'tectonic',
      [texPath, '--outdir', options.outDir, '--chatter', 'minimal'],
      { stdio: 'pipe' },
    );
  } catch (error) {
    throw new RenderError(
      `Tectonic failed to compile ${texPath}. The Selection and template may have drifted, or a LaTeX package could not be fetched.`,
      { cause: error },
    );
  }

  return { texPath, pdfPath };
}
