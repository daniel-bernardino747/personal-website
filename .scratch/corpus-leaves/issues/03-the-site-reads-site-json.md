# 03 — The site reads `site:json`, and its loader is deleted

**Status:** ready-for-agent

**Blocked by:** 02.

**What to do:** at build time the site runs `site:json` and `resume:pdf` in `CORPUS_REPO` and checks the `version`. It parses the output with its own zod types, as `prospect-me/recon/src/corpus.ts` does. About twenty files import `@/lib/corpus`, and they move to that parse.

`bake-corpus` writes the `site:json` output into the standalone artefact instead of copying markdown, and the agent reads that output. `/resume.pdf` serves the PDF that `career` rendered, so the site no longer needs Tectonic. Delete the site's `src/lib/corpus/`, `scripts/corpus-json.mjs` and `scripts/render-*.mjs`.

- [ ] No file in this repository parses Corpus markdown
- [ ] The home page, `/achievements`, `/chat` and `/resume.pdf` match what production served before the change
- [ ] The standalone artefact carries only the `site:json` output and the PDF, with no Corpus markdown
- [ ] `baked-corpus.test.ts` guards the new artefact shape
- [ ] Deployed and verified on www.teamdbsolutions.com
