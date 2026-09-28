# The Corpus leaves for its own repository

Status: ready-for-agent — decided in [ADR-0013](../../docs/adr/0013-the-corpus-leaves-for-its-own-repository.md)

## Problem

The Corpus lives inside one of its four readers. Everything private that any reader produces has settled in this public repository's gitignored folders: `content/` (166K) and `generated/` (920K). Neither is versioned or backed up. A lost disk loses the career record and every résumé ever sent.

## Solution

A private repository, `career`, a sibling of this checkout, holds the records, the schema and loader, the skills that write or render from them, and their output. This site reads a public contract, `site:json`, at build time. `prospect-me` keeps reading `corpus:json`, unchanged.

Layout of `career`:

```
corpus/          accomplishments/, affiliations/, articles/, identity.md
generated/       selections/, resumes/, letters/, linkedin/, email/, applications/
posts/           post-forge drafts
src/             schema, loader, contracts (corpus:json, site:json), render
.claude/skills/  capture, article, generate, cover-letter
```

## Order, and why

The data moves first, because backup is the most urgent gain and the code does not need to move for it to happen. Code moves next, then consumers switch, then docs catch up. Each ticket leaves every repository working. The one window of duplication, where the loader exists in both places, opens in 02 and closes in 03.

| # | Ticket | Blocked by |
|---|---|---|
| 01 | The data moves to a private repository, and the loader follows it by path | — |
| 02 | `career` owns the schema, the loader and both contracts | 01 |
| 03 | The site reads `site:json`, and its loader is deleted | 02 |
| 04 | The career skills and their renderer move to `career` | 02 |
| 05 | `prospect-me` reads the Corpus from `career` | 02 |
| 06 | Post drafts go to `career` | 01 |
| 07 | The docs of all three repositories describe the new shape | 03, 04, 05, 06 |

## Out of scope

- Prospect dossiers stay in `prospect-me` (ADR-0013).
- The devlog stays where it is until it produces an entry.
- A shared npm package for the contract types.
