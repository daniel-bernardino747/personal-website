# 07 — The docs of all three repositories describe the new shape

**Status:** done

**Blocked by:** 03, 04, 05, 06.

**What to do:** `career` gets a `CLAUDE.md` and a `CONTEXT.md`. `CONTEXT.md` moves out of this repository, since the domain language belongs to the Corpus, and the site keeps only the terms that are its own. This repository's `CLAUDE.md` and `README.md` stop describing `content/`, the career skills and Tectonic, and point at `career` instead. The ADRs stay here as history. `career` links to ADR-0002, 0003, 0004, 0005, 0009, 0010, 0011 and 0013 rather than copying them.

- [x] A fresh agent session in each repository finds the right instructions for that repository and no stale path

## Comments

Done 2026-09-28. The criterion was checked literally: three agents with no context from the migration read each repository from scratch and reported every instruction that pointed at a missing path or described old behaviour. Everything they found that the migration left behind was fixed:

- **personal-website.** `CONTEXT.md` now holds only the site's own terms and names `career/CONTEXT.md` as canonical. `PRODUCT.md`, the README opening, and four code comments no longer say `content/`. `CLAUDE.md` states the deploy rule (never `next build && railway up` by hand), that `dev` also needs Tectonic, that the tests fetch only the JSON, that `SITE_JSON_VERSION` changes in both repos together, and that the Corpus ADRs live here. `fetch-corpus` imports `SITE_JSON_VERSION` from `schema.ts` instead of repeating it.
- **career.** Error messages and comments in the render scripts, `featured-review`, `loader` and `schema` no longer say `content/`, "gitignored", "static export" or "public". The LaTeX header names `src/render/`. `CLAUDE.md` gained rules: `generated/` is committed, `featured:review` rewrites the sheet, where the "spec stories" come from, the `post-forge` dependency, and the sibling layout with `SITE_REPO`. The README command list matches `CLAUDE.md`. `CONTEXT.md` lists ADRs 0002–0005 and 0008–0013.
- **prospect-me.** ADR-0001 carries a note that ADR-0013 moved the Corpus. `corpusRepo()` treats an empty `CORPUS_REPO` (a copied `.env.example`) as unset and resolves a relative one from the repository root. Before, both silently pointed at `recon/`.

Found but outside this ticket, because they predate the migration: `npm run lint` is a no-op (`next lint` was removed in Next 16, and `.eslintrc.json` is ignored by ESLint 10), and the site's env vars (`ANTHROPIC_API_KEY`, `DATABASE_URL`, Turnstile, the chat limits) have no `.env.example`.
