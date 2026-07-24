# 01 — Loader and schema, proven by Vitest

**What to build:** the one module that stands between the `content/` directory and every consumer of the Corpus. It reads markdown-with-frontmatter files, validates them against the schema for Affiliation and Accomplishment, resolves each Accomplishment's Affiliation reference, and exposes typed Affiliations and Accomplishments plus the queries consumers need. No consumer ever parses frontmatter itself — this is the single seam the whole feature is built on, and the place a schema change is expected to land as real content accumulates. Vitest is introduced here as the project's first test runner.

The schema follows the domain model in `CONTEXT.md` and the field list in the spec: an Affiliation holds organisation, role, period and stack, referenced by a stable identifier; an Accomplishment holds an optional Affiliation reference, a date, a `kind` (engineering, talk, open-source, project, education, writing), the Metric, the prose statement, and a `featured` flag. An Accomplishment with no Metric is valid but marked a draft and excluded from Selections by default.

Tests point a fixture Corpus at the loader and assert on what comes out — never on how files are walked or parsed. Renaming an internal helper must not break a test.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Vitest is added to the project and runs via an npm script
- [x] A well-formed fixture Corpus parses into the expected typed Affiliations and Accomplishments
- [x] A missing required field fails loudly rather than yielding a partial record
- [x] An Accomplishment referencing a nonexistent Affiliation is rejected
- [x] An Accomplishment may have no Affiliation and still loads (talks, personal projects)
- [x] Featured filtering returns exactly the marked subset
- [x] Drafts (no Metric) are excluded by default and retrievable on request
- [x] Queries by kind and by Affiliation return the correct subsets
- [x] An empty Corpus is handled as a legitimate state, not a crash
- [x] The loader is safe to call at build time in a Server Component and is not pulled into any client bundle

## Comments

Implemented in `src/lib/corpus/` — `schema.ts` (zod schemas + `Affiliation`/`Accomplishment` types), `loader.ts` (`loadCorpus`, `CorpusError`), `index.ts` (public API). Frontmatter is read with `gray-matter`, validated with `zod`, and the file basename is the stable id. The `server-only` import keeps the loader out of client bundles; Vitest aliases it to its shipped no-op stub. Tests live in `loader.test.ts` against fixture Corpus directories under `__fixtures__/`. `npm test` runs the suite (15 tests). Content lives under `content/{affiliations,accomplishments}/*.md`; a missing/empty `content/` is a legitimate empty state.
