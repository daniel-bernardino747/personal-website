# 07 — The docs of all three repositories describe the new shape

**Status:** ready-for-agent

**Blocked by:** 03, 04, 05, 06.

**What to do:** `career` gets a `CLAUDE.md` and a `CONTEXT.md`. `CONTEXT.md` moves out of this repository, since the domain language belongs to the Corpus, and the site keeps only the terms that are its own. This repository's `CLAUDE.md` and `README.md` stop describing `content/`, the career skills and Tectonic, and point at `career` instead. The ADRs stay here as history. `career` links to ADR-0002, 0003, 0004, 0005, 0009, 0010, 0011 and 0013 rather than copying them.

- [ ] A fresh agent session in each repository finds the right instructions for that repository and no stale path
