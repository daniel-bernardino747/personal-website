# 01 — The data moves to a private repository, and the loader follows it by path

**Status:** ready-for-human — creating the GitHub repository is Daniel's go, and the push is the first time the career record leaves this machine for a third party.

**Blocked by:** nothing.

**What to do:** create `career` as a **private** GitHub repository, a sibling of this checkout. Confirm the remote is private *before* the first push. Move `content/` into `career/corpus/`, `generated/` into `career/generated/`, and `content/posts/` into `career/posts/`. Then commit and push.

No code moves in this ticket, and the site, `generate`, `cover-letter`, `capture` and `corpus:json` keep working. The loader's default root (`defaultContentDir()` in `src/lib/corpus/loader.ts`) resolves `CORPUS_REPO` (default `../career`) plus `corpus/`, the same way `prospect-me` resolves its checkout. Every skill and script that writes to `generated/` writes to `$CORPUS_REPO/generated/` instead. There are 20 references across the skills and scripts.

- [ ] `career` exists on GitHub, private, verified with `gh repo view --json visibility`
- [ ] `content/` and `generated/` are gone from this checkout, and their contents are committed in `career`
- [ ] `npm test`, `npm run build` and `npm run corpus:json` pass here, reading from `career`
- [ ] `generate` and `cover-letter` write their output into `career/generated/`
- [ ] A missing `career` checkout fails the build with a message that names `CORPUS_REPO`
- [ ] `.gitignore` keeps `/content` and `/generated`, so a stray copy can never be committed here
