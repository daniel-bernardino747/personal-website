# 03 — `career` produces a reviewed Portuguese translation, and `site:json` carries it

**Status:** done, 11/11/2026 (the translation itself is not written yet: 91 fields)

**Blocked by:** nothing.

**What to do (in `career`):** add a `translate:pt` step that translates the fields the site publishes (Identity: headline, bio, role; Accomplishments: title, summary, Metric; Affiliations: role, description) into a committed, human-editable file, for example `corpus/translations/pt.json`. Each entry records a hash of the English source it was translated from. Re-running it translates only new or changed fields and never overwrites a reviewed human edit. `site:json` emits the Portuguese beside the English, for example `{ en, pt?, ptStale? }` or a parallel `pt` block.

**What to do (here):** bump `SITE_JSON_VERSION` in `src/lib/corpus/schema.ts` together with `career`'s `src/corpus/site-export.ts`. Update the schema and fixtures, and have `corpus:fetch` print the fields that are stale or missing in Portuguese.

- [x] ADR-0005 holds: no Portuguese is written into the records themselves
- [x] A Metric's Portuguese is a reviewed string, never derived at runtime (ADR-0008)
- [x] Editing an English field marks its translation stale, and the site falls back to English for it
- [x] Both repos pass their tests with the new version

## Comments

Done 11/11/2026. In `career`: `34a83a6`. Here: the commit that bumps `SITE_JSON_VERSION` to 2.

- The translation is not an API call. `npm run translations` (in `career`) lists what is missing, stale or orphaned; `-- --todo` gives it as JSON. Claude writes `{ key: "texto" }` in a session and `-- --apply <file>` stamps each entry with the hash of its English (`corpus/translations/pt.json`). Daniel reviews the diff. No API key in `career`. Decided with Daniel on 11/11/2026.
- Keys: `identity.role.N`, `identity.bio`, `identity.services.N`, …, `affiliation:<id>.role`, `accomplishment:<id>.title|prose|metric|imageAlt`. Only what `site:json` publishes is translatable.
- **A statement is translated as its prose only** (`parseStatement(...).prose`). "Built with", "Live:" and "Repo:" stay in the English statement, which the site still parses for the chips and the links. This resolves the risk raised in ticket 02.
- `site:json` v2 carries `translations.pt = { texts, missing, stale }`, and `texts` only holds current entries. `corpus:fetch` warns: "pt shows English for 91 untranslated and 0 stale fields".
- `bake-corpus` carries the translations filtered to the baked records (43 of 91 keys). A new test in `baked-corpus.test.ts` ensures no key names a withheld record (ADR-0008).
- Next: write the 91 translations (a session in `career`, or here via `--todo`/`--apply`), then ticket 04 uses them.
