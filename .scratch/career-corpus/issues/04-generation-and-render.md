# 04 — Generation: Selection to Tectonic to PDF

**What to build:** the path from a job posting to a tailored resume PDF. A generation skill reads the Corpus, and given a pasted posting, emits a Selection — structured data naming the target role, the sections, the chosen Accomplishments in order, and the compressed text for each, where every entry keeps a reference to its source file. A minimal, versioned LaTeX template consumes that Selection and renders it to PDF via Tectonic. The model never writes LaTeX ([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md)) — standardisation is structural, so a Selection that departs from the expected shape fails to render rather than producing a different-looking document. The same generation machinery produces paste-ready blocks for a LinkedIn profile section and a GitHub profile summary, which are just other Render Targets over the same Corpus.

Selections and rendered PDFs are written to a gitignored directory outside the static export, so a resume naming a target employer is never publicly reachable and never committed ([stories 24, 25](../spec.md)). Portuguese output is produced by translating at render time from the English Corpus ([ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md)). The non-fabrication rule holds: a Selection ships only after being read, and its source references make that review cheap.

Tectonic is the engine — a single binary that fetches only the packages the document uses. It is not currently installed on the dev machine; installing it (winget / scoop / cargo on Windows) is a prerequisite step of this ticket, not an assumption. A single render smoke check asserts that a fixture Selection passes through the template and Tectonic and yields a non-trivial PDF; typography is not asserted. This ticket is testable with fixtures, independent of real content.

**Blocked by:** 01 — loader and schema (generation reads the Corpus through it).

**Status:** ready-for-agent

- [ ] Tectonic is installed and documented as a prerequisite
- [ ] Pasting a job posting into the generation skill produces a Selection naming the role, sections, and chosen Accomplishments in order
- [ ] Every entry in a Selection carries a reference to the source file it came from
- [ ] The model emits only the Selection — it never writes LaTeX
- [ ] A versioned LaTeX template renders a Selection to PDF via Tectonic
- [ ] A Selection that does not match the expected shape fails to render rather than producing a malformed document
- [ ] Paste-ready LinkedIn and GitHub blocks are produced from the same Corpus
- [ ] A Portuguese resume can be produced by translating the English Corpus at render time
- [ ] Selections and PDFs are written to a gitignored directory outside the static export
- [ ] A render smoke check asserts a non-trivial PDF is produced from a fixture Selection
