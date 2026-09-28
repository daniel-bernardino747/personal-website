# 02 — `career` owns the schema, the loader and both contracts

**Status:** ready-for-agent

**Blocked by:** 01.

**What to do:** move `src/lib/corpus/` into `career/src/` (schema, loader, statement and export, with their tests and fixtures). `career` gets its own `package.json` and Vitest. Add three commands:

- `corpus:json`: unchanged. Still version 1, with byte-for-byte the output it has today.
- `site:json`: new. It carries exactly what the site publishes (ADR-0013): the Identity, every Affiliation, every `project` Accomplishment with drafts and `image`, and the Featured Accomplishments. It has its own `version`.
- `resume:pdf`: the complete résumé of ADR-0009, rendered by `career`. `src/lib/resume/complete.ts` and the Tectonic templates move with it.

The site keeps its own copy of the loader until 03 deletes it. That duplication is deliberate and lasts one ticket.

- [ ] `npm test` in `career` is green, with the moved suites
- [ ] The `corpus:json` output diffs empty against the output before the move
- [ ] A test proves `site:json` emits no Accomplishment that is neither Featured nor a project
- [ ] `resume:pdf` produces the same PDF the site's `/resume.pdf` serves today
