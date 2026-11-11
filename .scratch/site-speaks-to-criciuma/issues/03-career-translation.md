# 03 — `career` produces a reviewed Portuguese translation, and `site:json` carries it

**Status:** ready-for-human (touches `career`)

**Blocked by:** nothing.

**What to do (in `career`):** add a `translate:pt` step that translates the fields the site publishes (Identity: headline, bio, role; Accomplishments: title, summary, Metric; Affiliations: role, description) into a committed, human-editable file, for example `corpus/translations/pt.json`. Each entry records a hash of the English source it was translated from. Re-running it translates only new or changed fields and never overwrites a reviewed human edit. `site:json` emits the Portuguese beside the English, for example `{ en, pt?, ptStale? }` or a parallel `pt` block.

**What to do (here):** bump `SITE_JSON_VERSION` in `src/lib/corpus/schema.ts` together with `career`'s `src/corpus/site-export.ts`. Update the schema and fixtures, and have `corpus:fetch` print the fields that are stale or missing in Portuguese.

- [ ] ADR-0005 holds: no Portuguese is written into the records themselves
- [ ] A Metric's Portuguese is a reviewed string, never derived at runtime (ADR-0008)
- [ ] Editing an English field marks its translation stale, and the site falls back to English for it
- [ ] Both repos pass their tests with the new version
