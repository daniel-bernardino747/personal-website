# 02 — `career` owns the schema, the loader and both contracts

**Status:** done — career@430dd8a

**Blocked by:** 01.

**What to do:** move `src/lib/corpus/` into `career/src/` (schema, loader, statement and export, with their tests and fixtures). `career` gets its own `package.json` and Vitest. Add three commands:

- `corpus:json`: unchanged. Still version 1, with byte-for-byte the output it has today.
- `site:json`: new. It carries exactly what the site publishes (ADR-0013): the Identity, every Affiliation, every `project` Accomplishment with drafts and `image`, and the Featured Accomplishments. It has its own `version`.
- `resume:pdf`: the complete résumé of ADR-0009, rendered by `career`. `src/lib/resume/complete.ts` and the Tectonic templates move with it.

The site keeps its own copy of the loader until 03 deletes it. That duplication is deliberate and lasts one ticket.

- [x] `npm test` in `career` is green, with the moved suites
- [x] The `corpus:json` output diffs empty against the output before the move
- [x] A test proves `site:json` emits no Accomplishment that is neither Featured nor a project
- [x] `resume:pdf` produces the same PDF the site's `/resume.pdf` serves today

## Comments

Done 2026-09-28, in `career` commit 430dd8a.

- `src/corpus/` (schema, loader, statement, export), `src/render/` and `src/resume/complete.ts` were copied with their tests and fixtures. `server-only` and the `@/` alias were dropped. `career` resolves its own `corpus/` and `generated/`. `content.example/` became `corpus.example/`.
- Scripts run through `tsx`: `corpus:json`, `site:json` and `resume:pdf` (`--out-dir`, default `generated/complete/`, which is ignored).
- `npm test` in `career` passes 96 tests across 9 files, including the render tests.
- `corpus:json` is byte-identical to this repository's output (14714 bytes).
- `site:json` over the real Corpus emits 19 of 32 Accomplishments (6 Featured, 16 projects, 10 of them drafts) and all 4 Affiliations. `site-export.test.ts` asserts, on the fixtures and on the real Corpus, that nothing outside Featured or `project` is emitted.
- `resume:pdf` writes a `.tex` byte-identical to the one this site renders for `/resume.pdf`. The PDF bytes differ by timestamp only.
- The render CLIs (`render`, `render:letter`) were not copied. They move with the skills in 04.
