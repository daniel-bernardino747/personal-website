# 04 — Pages render the Corpus in the page's language

**Status:** ready-for-agent

**Blocked by:** 01, 03

**What to do:** `getCorpus()` / `getIdentity()` (or a thin wrapper) take a locale and return Portuguese fields where they exist and are not stale, falling back to English per field. `IdentityProvider`, `careerTimeline`, project cards, `/achievements` and Labs all receive the localized view. The fallback must be visible in development (for example, a `data-fallback` attribute) so Daniel can see what is still untranslated.

- [ ] A test covers the per-field fallback and the stale case
- [ ] `bake-corpus` / `pack-deploy` still accept the package (the Featured slice carries both languages)
