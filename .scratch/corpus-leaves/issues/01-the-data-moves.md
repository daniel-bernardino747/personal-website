# 01 — The data moves to a private repository, and the loader follows it by path

**Status:** done — Daniel gave the go on 2026-09-28

**Blocked by:** nothing.

**What to do:** create `career` as a **private** GitHub repository, a sibling of this checkout. Confirm the remote is private *before* the first push. Move `content/` into `career/corpus/`, `generated/` into `career/generated/`, and `content/posts/` into `career/posts/`. Then commit and push.

No code moves in this ticket, and the site, `generate`, `cover-letter`, `capture` and `corpus:json` keep working. The loader's default root (`defaultContentDir()` in `src/lib/corpus/loader.ts`) resolves `CORPUS_REPO` (default `../career`) plus `corpus/`, the same way `prospect-me` resolves its checkout. Every skill and script that writes to `generated/` writes to `$CORPUS_REPO/generated/` instead. There are 20 references across the skills and scripts.

- [x] `career` exists on GitHub, private, verified with `gh repo view --json visibility`
- [x] `content/` and `generated/` are gone from this checkout, and their contents are committed in `career`
- [x] `npm test`, `npm run build` and `npm run corpus:json` pass here, reading from `career`
- [x] `generate` and `cover-letter` write their output into `career/generated/`
- [x] A missing `career` checkout fails the build with a message that names `CORPUS_REPO`
- [x] `.gitignore` keeps `/content` and `/generated`, so a stray copy can never be committed here

## Comments

Done 2026-09-28. `career` is at github.com/daniel-bernardino747/career, verified PRIVATE before the first push. It holds 103 files, identical to the originals by `diff -r`.

- `src/lib/corpus/location.ts` resolves the Corpus: `CORPUS_DIR` if set, else `$CORPUS_REPO/corpus`, else `../career/corpus`. The loader, `bake-corpus`, `featured-review` and both render scripts read it.
- The deployed image sets `CORPUS_DIR=/app/content`, the baked Featured slice. The runtime was simulated with `CORPUS_DIR=.next/standalone/content npm run corpus:json`, which gave 6 records, all Featured.
- `npm test` is green, including the new `location.test.ts`, which covers the missing-checkout message. `npm run build` bakes 6 Featured records and withholds 26. `npm run render` wrote into `career/generated/resumes/`. `prospect-me`'s `recon validate techifide` passes through `corpus:json`.
- `content/devlog/` stays here (ADR-0013), so `content/` still exists, holding only that. The skills' paths now point at `../career/…` until ticket 04 moves them.
- Not yet deployed. The next `npm run deploy` is the first that carries `CORPUS_DIR` in the Dockerfile.
