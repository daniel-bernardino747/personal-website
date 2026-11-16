# 01 — The contract accepts `.mp4` screens (v4) and ADR-0018

**Status:** done, 16/11/2026 (approved by Daniel after seeing it locally)

**Blocked by:** nothing.

- [x] `career`: an image `src` may end in `.webp` or `.mp4`; the first entry must be `.webp`; `imageName` strips either extension; a name may not appear twice whatever its extension
- [x] `career`: `SITE_JSON_VERSION = 4`; tests for an accepted video screen, a refused video cover, a refused other extension
- [x] site: the same rules in `schema.ts`, `SITE_JSON_VERSION = 4`, fixture and tests; `imageName` strips either extension; `isVideo` and `posterOf` helpers
- [x] `docs/adr/0018-…`; ADR-0017 points to it

## Comments

Built 16/11/2026, not committed.

- `career`: `src` may end in `.webp` or `.mp4`; the loader refuses a video cover (new fixture `video-cover`); `isVideo`; `imageName` strips either extension; `SITE_JSON_VERSION = 4`; the well-formed fixture carries a video screen. 120 tests pass.
- site: the same regex with a `.refine` that the cover is a `.webp`, `SITE_JSON_VERSION = 4`, `isVideo` and `posterOf` in `src/lib/projects/image.ts`, a `source.test.ts` case (video screen accepted, video cover and `.gif` refused).
- ADR-0018; ADR-0017 points to it.
