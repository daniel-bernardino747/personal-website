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
 * The layout is derived from Celio B Junior's resume-template
 * (https://github.com/celiobjunior/resume-template), Apache-2.0. Its notice is
 * reproduced in every document this module emits, which is what that licence
 * asks of a derivative work.
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
 *
 * 3 — the group heading became structured (`organisation` / `location` / `role` /
 * `period`) so the template can set organisation and location on one line and
 * role and period on the next, each pair pushed apart with `\hfill`. A version-2
 * Selection carried all of that as one pre-joined string, which cannot be split
 * back apart, so it is refused rather than guessed at.
 */
export const SELECTION_VERSION = 3;

const linkSchema = z.strictObject({
  label: z.string().min(1),
  url: z.string().min(1),
});

/**
 * One résumé line: the model-compressed statement plus `source` — the id of the
 * Corpus file it came from. `source` is the audit trail ([ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)):
 * it ties every claim back to what Daniel actually wrote and is never printed on
 * the résumé itself.
 *
 * `label` is an optional bold lead-in for a line that is a labelled list rather
 * than a claim — "Techs & frameworks: Next.js, Prisma, Zod." It renders as
 * `\textbf{label:}` ahead of the text.
 */
const entrySchema = z.strictObject({
  source: z.string().min(1),
  label: z.string().min(1).optional(),
  text: z.string().min(1),
});

/**
 * A group's context line, kept in parts rather than pre-joined. The template sets
 * `organisation` bold on the left of its line with `location` flush right, then
 * `role` and `period` the same way on the line beneath — a layout that needs the
 * four values separately. A single pre-joined string could not be split back into
 * them, which is why version 3 refuses one.
 *
 * Only `organisation` is required: a personal project has no location, and a
 * degree may have no role.
 */
const headingSchema = z.strictObject({
  organisation: z.string().min(1),
  location: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  period: z.string().min(1).optional(),
});

type Heading = z.infer<typeof headingSchema>;

/**
 * The bullets that share one context line — an employer, a client, a project.
 * The Corpus stores each Accomplishment on its own, carrying its own affiliation,
 * so three things done at one employer arrive as three unrelated records; without
 * this level they render as three separate-looking jobs. The group is where the
 * Selection states that they belong together: `heading` is written once and its
 * `entries` sit beneath it.
 *
 * A group with no `heading` is a bare list of bullets — right for a section whose
 * lines need no attribution. A group with a `heading` and no `entries` is a
 * context line standing alone — how a degree appears under Education. A group
 * with neither says nothing at all, and is refused.
 */
const groupSchema = z
  .strictObject({
    heading: headingSchema.optional(),
    entries: z.array(entrySchema).default([]),
  })
  .refine((group) => group.heading !== undefined || group.entries.length > 0, {
    message:
      'a group needs a heading, entries, or both — an empty group renders nothing',
  });

const sectionSchema = z.strictObject({
  title: z.string().min(1),
  groups: z.array(groupSchema).min(1),
});

/**
 * The résumé header. `role` is optional: the reference template names the person
 * and their contact details only, but a Selection tailored to one posting often
 * wants a headline under the name, so it renders when present and is omitted
 * otherwise.
 */
const headerSchema = z.strictObject({
  name: z.string().min(1),
  role: z.string().min(1).optional(),
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

/**
 * The upstream template's licence notice, carried into every generated document.
 * Apache-2.0 asks a derivative work to retain the copyright notice and a pointer
 * to the licence; the `.tex` is where a reader of the output can see it.
 */
const TEMPLATE_NOTICE = [
  '% Resume layout derived from https://github.com/celiobjunior/resume-template',
  '% Copyright (c) 2025 Celio B Junior. Licensed under the Apache License, Version 2.0.',
  '% You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0',
  '%',
  '% Generated by src/lib/render/resume.ts from a Selection - do not edit by hand.',
];

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
 * Typographic punctuation, mapped to a form the template's fonts can actually
 * set. Tectonic runs XeTeX, which reads the source as Unicode, but `fontenc` T1
 * binds the document to the legacy `ec-*` fonts. Those cover accented Latin — so
 * "Criciúma" is fine — and nothing beyond it: an em dash, a curly quote or an
 * ellipsis is dropped from the output with a warning and no error, leaving a
 * silent hole in the résumé. Rewriting them to LaTeX's own forms is what keeps
 * the reference template's fonts and still prints the character.
 */
const UNICODE_PUNCTUATION: Record<string, string> = {
  '—': '---', // em dash
  '–': '--', // en dash
  '−': '-', // minus sign
  '‑': '-', // non-breaking hyphen
  '“': '``', // left double quote
  '”': "''", // right double quote
  '‘': '`', // left single quote
  '’': "'", // right single quote
  '…': '\\ldots{}',
  ' ': '~', // no-break space
  ' ': '~', // narrow no-break space
  '·': '$\\cdot$',
  '•': '$\\bullet$',
  '→': '$\\rightarrow$',
  '×': '$\\times$',
  '≤': '$\\leq$',
  '≥': '$\\geq$',
};

const UNICODE_PUNCTUATION_PATTERN = new RegExp(
  `[${Object.keys(UNICODE_PUNCTUATION).join('')}]`,
  'g',
);

/**
 * Escape LaTeX special characters in authored prose, then rewrite typographic
 * punctuation the template's fonts cannot set.
 *
 * Two passes, in this order. The first is a single pass over the original string
 * — the replacements themselves contain braces and backslashes, but those are
 * never rescanned — so no character is double-escaped. The second matches only
 * the Unicode punctuation above, which the first pass never emits, so the
 * backslashes it introduces are left alone.
 */
function escapeLatex(text: string): string {
  return text
    .replace(/[\\{}$&#%_~^]/g, (char) => LATEX_ESCAPES[char])
    .replace(UNICODE_PUNCTUATION_PATTERN, (char) => UNICODE_PUNCTUATION[char]);
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

/**
 * Strip the characters that would break a `\hypersetup` value. Those fields are
 * brace-delimited, so an unbalanced brace in a name derails the preamble before
 * any content is typeset.
 */
function escapePdfString(text: string): string {
  return text.replace(/[\\{}]/g, '');
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

/** The preamble: page setup, PDF metadata, and the ruled section heading. */
function buildPreamble(selection: Selection): string[] {
  const { header, language } = selection;
  const pdfName = escapePdfString(header.name);

  return [
    ...TEMPLATE_NOTICE,
    '',
    '\\documentclass[a4paper,10pt]{article}',
    '',
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[T1]{fontenc}',
    `\\usepackage[${LANGUAGE_BABEL[language]}]{babel}`,
    '\\usepackage{geometry}',
    '\\usepackage{parskip}',
    '\\usepackage{hyperref}',
    '\\usepackage{titlesec}',
    '',
    '\\geometry{top=1.0cm, bottom=1.0cm, left=1.0cm, right=1.0cm}',
    '\\pagestyle{empty}',
    '',
    '\\hypersetup{',
    `    pdftitle={CV - ${pdfName}},`,
    `    pdfauthor={${pdfName}},`,
    '    colorlinks=true,',
    '    linkcolor=black,',
    '    urlcolor=black,',
    '    citecolor=black,',
    '    bookmarksdepth=1',
    '}',
    '',
    '\\setcounter{secnumdepth}{0}',
    '',
    '\\titleformat{\\section}',
    '{\\Large\\bfseries}',
    '{}',
    '{0em}',
    '{}',
    '[\\titlerule\\vspace{0.5ex}]',
    '',
  ];
}

/** The centred identity block: name, optional headline, then the contact line. */
function buildHeader(selection: Selection): string[] {
  const { header } = selection;
  const lines = [
    '\\begin{center}',
    `    {\\LARGE \\textbf{${escapeLatex(header.name)}}}`,
    '    \\\\ [0.1cm]',
  ];

  if (header.role !== undefined) {
    lines.push(`    {\\large ${escapeLatex(header.role)}}`, '    \\\\ [0.1cm]');
  }

  // Location, email and each profile link, separated by bullets. The email is a
  // mailto link so the address is clickable in the PDF, not merely legible.
  const contact = [
    `    ${escapeLatex(header.location)}`,
    `    Email: \\href{mailto:${escapeUrl(header.email)}}{${escapeLatex(header.email)}}`,
    ...header.links.map(
      (link) => `    \\href{${escapeUrl(link.url)}}{${escapeLatex(link.label)}}`,
    ),
  ];
  lines.push(contact.join('\n    {\\textbullet}\n'));
  lines.push('\\end{center}');
  return lines;
}

/**
 * A group's context line. `organisation` sits bold on the left with `location`
 * pushed flush right, and `role` and `period` do the same on the line beneath.
 *
 * `\hfill` and `\textbf` mean nothing in a PDF bookmark, so `\texorpdfstring`
 * supplies a plain-text alternative — without it hyperref warns and the outline
 * entry comes out mangled.
 */
function buildHeading(heading: Heading): string[] {
  const organisation = escapeLatex(heading.organisation);
  const location =
    heading.location !== undefined ? escapeLatex(heading.location) : undefined;

  const typeset =
    location !== undefined
      ? `\\textbf{${organisation}} \\hfill ${location}`
      : `\\textbf{${organisation}}`;
  const bookmark =
    location !== undefined ? `${organisation} -- ${location}` : organisation;

  const lines = [
    '    \\subsection*{\\texorpdfstring{',
    `            ${typeset}`,
    '        }{',
    `            ${bookmark}`,
    '        }}',
  ];

  const role = heading.role !== undefined ? escapeLatex(heading.role) : undefined;
  const period =
    heading.period !== undefined ? escapeLatex(heading.period) : undefined;
  if (role !== undefined && period !== undefined) {
    lines.push(`    \\textit{${role} \\hfill ${period}}`);
  } else if (role !== undefined) {
    lines.push(`    \\textit{${role}}`);
  } else if (period !== undefined) {
    lines.push(`    \\textit{\\hfill ${period}}`);
  }

  return lines;
}

/** Assemble the LaTeX document for a validated Selection. */
function buildTex(selection: Selection): string {
  const { summary, sections } = selection;
  const lines: string[] = [
    ...buildPreamble(selection),
    '\\begin{document}',
    '',
    ...buildHeader(selection),
    '',
  ];

  if (summary !== undefined) {
    lines.push(escapeLatex(summary), '');
  }

  for (const section of sections) {
    lines.push(`\\section{${escapeLatex(section.title)}}`);
    for (const group of section.groups) {
      if (group.heading !== undefined) {
        lines.push(...buildHeading(group.heading));
      }
      // A heading-only group — a degree with no bullets — emits no list at all:
      // an empty itemize is a LaTeX error, not an empty space.
      if (group.entries.length > 0) {
        lines.push('        \\begin{itemize}');
        for (const entry of group.entries) {
          const text = escapeLatex(entry.text);
          const body =
            entry.label !== undefined
              ? `\\textbf{${escapeLatex(entry.label)}:} ${text}`
              : text;
          lines.push(`            \\item ${body}`);
        }
        lines.push('        \\end{itemize}');
      }
    }
    lines.push('');
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
