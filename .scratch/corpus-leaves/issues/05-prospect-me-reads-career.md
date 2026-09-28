# 05 — `prospect-me` reads the Corpus from `career`

**Status:** done on branch `corpus-from-career` of prospect-me; lands when that PR merges

**Blocked by:** 02.

**What to do:** in `prospect-me/recon/src/corpus.ts`, change the default of `CORPUS_REPO` from `../personal-website` to `../career`. The contract does not change.

- [x] `npm run recon -- validate techifide` passes against `career`
- [x] `prospect-me/CLAUDE.md` and `.env.example` name `career`

## Comments

Done 2026-09-28, together with 03 (it had to be, since 03 deletes this repository's `corpus:json`). `recon/src/corpus.ts` defaults to `../career`. `recon validate` passes for techifide and tarken, and all 393 prospect-me tests pass.
