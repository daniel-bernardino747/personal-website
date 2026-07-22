# 02 — The site renders from the Corpus

**What to build:** the portfolio site stops carrying placeholder and hardcoded career facts and starts reading everything from the Corpus through the loader. Two kinds of work: repoint every component that imports career data from `src/data/` to the loader, and extract career facts currently written directly into component markup — the GenAI Science Club, UFSC and the experience blurb hardcoded in `BentoExperiences` — into `content/` files. The real facts already present in the repo (identity from `profile.ts`, plus those bento facts) are migrated as the site's first real Corpus content; placeholder entries with no basis are dropped rather than carried over.

Identity — name, contact, location, profile URLs — moves into the Corpus, because it is the resume header and must not disagree with the site. What stays in `src/data/` is genuine configuration: navigation, theme, and the scripted chat responses. The `Achievement` vocabulary and `achievements.ts` are retired; the achievements page renders Featured Accomplishments instead. Whether the `/achievements` route keeps its URL is the implementer's call.

A malformed Corpus must fail the static export build rather than producing a broken page.

**Blocked by:** 01 — loader and schema.

**Status:** ready-for-agent

- [ ] Every component that read career data from `src/data/` now reads it through the loader
- [ ] Career facts hardcoded in `BentoExperiences` markup are extracted into `content/` and rendered from there
- [ ] Identity and contact details live in the Corpus and feed the site
- [ ] `achievements.ts` and the `Achievement` type are removed; the achievements page renders Featured Accomplishments
- [ ] Only genuine configuration (navigation, theme, chat responses) remains in `src/data/`
- [ ] `npm run build` produces a static export whose career facts come entirely from `content/`
- [ ] A malformed Corpus fails the build rather than deploying a broken site
