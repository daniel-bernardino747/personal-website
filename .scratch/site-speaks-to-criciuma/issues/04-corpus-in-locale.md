# 04 — Pages render the Corpus in the page's language

**Status:** done (not deployed), 12/11/2026

**Blocked by:** 01, 03

**What to do:** `getCorpus()` / `getIdentity()` (or a thin wrapper) take a locale and return Portuguese fields where they exist and are not stale, falling back to English per field. `IdentityProvider`, `careerTimeline`, project cards, `/achievements` and Labs all receive the localized view. The fallback must be visible in development (for example, a `data-fallback` attribute) so Daniel can see what is still untranslated.

- [x] A test covers the per-field fallback and the stale case
- [x] `bake-corpus` / `pack-deploy` still accept the package (the Featured slice carries both languages)

## Comments

Done 12/11/2026.

- `src/lib/corpus/localize.ts` (`localizeSiteJson`) picks, field by field, the current translation `career` shipped, or the English when it is missing or stale. `fromSiteJson`/`readCorpus`/`getCorpus`/`getIdentity` take the locale (default `en`, so the agent and the API route keep English until ticket 07).
- A project's prose is replaced and the English "Built with / Live: / Repo:" tail is re-attached, so `parseStatement` still produces the chips and the links. Checked on the page: the plaid-sync-ledger card is in Portuguese and keeps its chips.
- An Affiliation's `organisation` became translatable in `career` (`f7292cc`), because "Folhas Que Salvam ("Leaves That Save")" carried an English gloss. Pointed out by Daniel in a screenshot of the timeline.
- The fallback is not marked in development (no `data-fallback`): `corpus:fetch` already lists what is missing or stale, and today everything is translated (95/95).
- The `/achievements` page still shows a full statement; with the Portuguese, any English "Built with" tail would appear there. None of today's Featured non-projects has that tail.
