# 05 — `prospect-me` reads the Corpus from `career`

**Status:** ready-for-agent

**Blocked by:** 02.

**What to do:** in `prospect-me/recon/src/corpus.ts`, change the default of `CORPUS_REPO` from `../personal-website` to `../career`. The contract does not change.

- [ ] `npm run recon -- validate techifide` passes against `career`
- [ ] `prospect-me/CLAUDE.md` and `.env.example` name `career`
