# 02 — The site renders from the Corpus

**What to build:** the portfolio site stops carrying placeholder and hardcoded career facts and starts reading everything from the Corpus through the loader. Two kinds of work: repoint every component that imports career data from `src/data/` to the loader, and extract career facts currently written directly into component markup — the GenAI Science Club, UFSC and the experience blurb hardcoded in `BentoExperiences` — into `content/` files. The real facts already present in the repo (identity from `profile.ts`, plus those bento facts) are migrated as the site's first real Corpus content; placeholder entries with no basis are dropped rather than carried over.

Identity — name, contact, location, profile URLs — moves into the Corpus, because it is the resume header and must not disagree with the site. What stays in `src/data/` is genuine configuration: navigation, theme, and the scripted chat responses. The `Achievement` vocabulary and `achievements.ts` are retired; the achievements page renders Featured Accomplishments instead. Whether the `/achievements` route keeps its URL is the implementer's call.

A malformed Corpus must fail the static export build rather than producing a broken page.

**Blocked by:** 01 — loader and schema.

**Status:** done

- [x] Every component that read career data from `src/data/` now reads it through the loader
- [x] Career facts hardcoded in `BentoExperiences` markup are extracted into `content/` and rendered from there
- [x] Identity and contact details live in the Corpus and feed the site
- [x] `achievements.ts` and the `Achievement` type are removed; the achievements page renders Featured Accomplishments
- [x] Only genuine configuration (navigation, theme, chat responses) remains in `src/data/`
- [x] `npm run build` produces a static export whose career facts come entirely from `content/`
- [x] A malformed Corpus fails the build rather than deploying a broken site

## Comments

Implemented on branch `chore/career-corpus-foundations`.

**Identity as a Corpus entity.** Added a third entity — `Identity`, one file at
`content/identity.md`: structured fields in frontmatter, the bio as the body.
The loader now returns `identity?` (absent is a legitimate empty state, so
ticket-01's empty-Corpus contract holds). The site's façade `getIdentity()` in
`src/lib/corpus/site.ts` throws a `CorpusError` when it is missing, so the static
export fails rather than shipping a header with no name.

**The server/client seam.** The loader is `server-only`, but most identity
consumers are Client Components. A Server Component (the root layout) reads the
Identity at build time and seeds `IdentityProvider`; client components read it
through `useIdentity()`. Corpus reads never enter a client bundle. Server
components (`page.tsx`, `achievements`, `Skills`) call the loader directly;
`page.tsx` passes `affiliations`/`projects` down as props.

**Bento content extraction.** UFSC and the GenAI Science Club became Affiliations
(`content/affiliations/`); the experience blurb became `Identity.headline`.
`BentoExperiences` now renders those, no facts in the markup.

**Decisions worth flagging:**
- `Affiliation.period` relaxed to optional — the two background Affiliations have
  no dates in the repo and inventing them would violate ADR-0003. The loader seam
  absorbing schema change is exactly what the spec anticipates.
- `Identity.headline` added (optional) as the home for the experience blurb — it
  is neither an Accomplishment (no Metric) nor an Affiliation.
- `stack.ts` / `tech-stack.tsx` (tech-icon marquee) were kept in `src/data/` as
  presentational configuration: they carry no Metric, date or Affiliation and map
  to no Corpus entity. Treating a global skills widget as career data would mean
  inventing an entity this ticket does not define.
- Identity placeholders (`bookingUrl: cal.com/yourname`, `email: [EMAIL_ADDRESS]`)
  were migrated verbatim from `profile.ts` — they were already live pre-ticket and
  are Daniel's to fill in; the schema stays lenient (`min(1)`) so real content is
  not blocked by strict URL/email validation that would force a fabricated value.

Loader tests: 21 pass (was 15) — Identity load/validation and period-optional
added. `npx tsc --noEmit`, `npm test`, `npm run build` all green.
