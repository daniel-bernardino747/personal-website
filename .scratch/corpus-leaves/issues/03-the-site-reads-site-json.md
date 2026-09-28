# 03 — The site reads `site:json`, and its loader is deleted

**Status:** implemented, not deployed. The last criterion waits on `npm run deploy`.

**Blocked by:** 02.

**What to do:** at build time the site runs `site:json` and `resume:pdf` in `CORPUS_REPO` and checks the `version`. It parses the output with its own zod types, as `prospect-me/recon/src/corpus.ts` does. About twenty files import `@/lib/corpus`, and they move to that parse.

`bake-corpus` writes the `site:json` output into the standalone artefact instead of copying markdown, and the agent reads that output. `/resume.pdf` serves the PDF that `career` rendered, so the site no longer needs Tectonic. Delete the site's `src/lib/corpus/`, `scripts/corpus-json.mjs` and `scripts/render-*.mjs`.

- [x] No file in this repository parses Corpus markdown
- [x] The home page, `/achievements`, `/chat` and `/resume.pdf` match what production served before the change
- [x] The standalone artefact carries only the `site:json` output and the PDF, with no Corpus markdown
- [x] `baked-corpus.test.ts` guards the new artefact shape
- [ ] Deployed and verified on www.teamdbsolutions.com

## Comments

Implemented 2026-09-28.

- `@/lib/corpus` keeps its names (`getCorpus`, `getIdentity`, the types, `KIND_LABELS`, `statement`, `career`), so the pages barely changed. The markdown loader was replaced by `source.ts`, which reads `site:json` through a zod schema of the contract in `schema.ts`, checks `version` first, and re-resolves Affiliations by id. The fixture is `career`'s own `toSiteJson` output, plus a draft project.
- `scripts/fetch-corpus.mjs` (`npm run corpus:fetch`) runs before `dev`, `dev:mock`, `build` and `test` (`--json-only` for tests). It writes `.corpus/site.json` and `.corpus/resume.pdf`, which is gitignored.
- `bake-corpus` writes only the Featured slice to `.next/standalone/corpus/site.json` and deletes anything traced. `pack-deploy` refuses an artefact with a non-Featured record or a traced `.corpus/`/`content/`. The Dockerfile sets `SITE_JSON`. `deploy.tar` went from 131 MB to 49.5 MB. The likely cause, not investigated, is that the résumé route no longer pulls the renderer into the trace. The unpacked server runs; see below.
- `/resume.pdf` serves `career`'s PDF. It is the same size as production's (46891 bytes) and differs only in the trailing ID/timestamp bytes.
- Verified by unpacking `deploy.tar` and running `server.js` as the container would. `/`, `/achievements`, `/chat`, `/resume.pdf` and `/opengraph-image` all answered 200. The visible text of `/` and `/achievements` is identical to production line for line.
- Deleted: the markdown loader and its tests and fixtures, `export`, `content.example/` (now `career/corpus.example/`), `src/lib/resume/complete.ts`, `scripts/corpus-json.mjs`. `featured-review` moved to `career` (`npm run featured:review`).
- **Deviation from the plan:** `scripts/render-*.mjs` and `src/lib/render/` stay here until 04, because `generate` and `cover-letter` still run from this checkout. They list `career/corpus/accomplishments/` for the source check but parse no markdown. `corpus:json` was deleted here only together with 05, so `prospect-me` was never left pointing at a missing script.
- The Corpus-writing guide moved from this README to `career`'s. `capture` validates with `npm test --prefix ../career -- content`.
