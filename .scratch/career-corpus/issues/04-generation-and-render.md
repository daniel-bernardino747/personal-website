# 04 — Generation: Selection to Tectonic to PDF

**What to build:** the path from a job posting to a tailored resume PDF. A generation skill reads the Corpus, and given a pasted posting, emits a Selection — structured data naming the target role, the sections, the chosen Accomplishments in order, and the compressed text for each, where every entry keeps a reference to its source file. A minimal, versioned LaTeX template consumes that Selection and renders it to PDF via Tectonic. The model never writes LaTeX ([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md)) — standardisation is structural, so a Selection that departs from the expected shape fails to render rather than producing a different-looking document. The same generation machinery produces paste-ready blocks for a LinkedIn profile section and a GitHub profile summary, which are just other Render Targets over the same Corpus.

Selections and rendered PDFs are written to a gitignored directory outside the static export, so a resume naming a target employer is never publicly reachable and never committed ([stories 24, 25](../spec.md)). Portuguese output is produced by translating at render time from the English Corpus ([ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md)). The non-fabrication rule holds: a Selection ships only after being read, and its source references make that review cheap.

Tectonic is the engine — a single binary that fetches only the packages the document uses. It is not currently installed on the dev machine; installing it (winget / scoop / cargo on Windows) is a prerequisite step of this ticket, not an assumption. A single render smoke check asserts that a fixture Selection passes through the template and Tectonic and yields a non-trivial PDF; typography is not asserted. This ticket is testable with fixtures, independent of real content.

**Blocked by:** 01 — loader and schema (generation reads the Corpus through it).

**Status:** ready-for-human

- [x] Tectonic is installed and documented as a prerequisite
- [x] Pasting a job posting into the generation skill produces a Selection naming the role, sections, and chosen Accomplishments in order
- [x] Every entry in a Selection carries a reference to the source file it came from
- [x] The model emits only the Selection — it never writes LaTeX
- [x] A versioned LaTeX template renders a Selection to PDF via Tectonic
- [x] A Selection that does not match the expected shape fails to render rather than producing a malformed document
- [x] Paste-ready LinkedIn and GitHub blocks are produced from the same Corpus
- [x] A Portuguese resume can be produced by translating the English Corpus at render time
- [x] Selections and PDFs are written to a gitignored directory outside the static export
- [x] A render smoke check asserts a non-trivial PDF is produced from a fixture Selection

## Comments

**Implementation (`/implement 04`).** Render pipeline in `src/lib/render/resume.ts`
(self-contained, Corpus-free so it stays fixture-testable): a strict, versioned
zod `selectionSchema`, LaTeX escaping, a minimal versioned template, and
`renderSelectionToTex` / `renderSelectionToPdf` / `isTectonicAvailable`. A
malformed Selection throws `RenderError` before any file is written — the
structural standardisation of ADR-0004. `source` is validated on every entry but
kept out of the rendered PDF (it is the ADR-0003 audit field, not résumé content).

The `generate` skill (`.claude/skills/generate/SKILL.md`) governs Selection
production, Portuguese-at-render-time, and the LinkedIn/GitHub blocks; the model
emits only the Selection JSON. `scripts/render-resume.mjs` (`npm run render`) is
the one mechanical step that touches LaTeX; it cross-checks every `source` against
`content/accomplishments/` and fails loudly on a stale reference (story 23).
Output lands in the gitignored `generated/`. Tectonic 0.16.9 installed via scoop.

Smoke + unit coverage in `src/lib/render/resume.test.ts`; the Tectonic smoke test
`skipIf`s when the binary is absent so the suite stays green without it.
