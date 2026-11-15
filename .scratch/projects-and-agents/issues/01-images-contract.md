# 01 — The `images[]` contract, migration and ADR

**Status:** done (not yet committed or deployed), 15/11/2026

**Blocked by:** nothing.

**Repos:** `career` and this site, shipped together (the version check refuses a mismatch).

**What to do:** replace the single `image` with an ordered `images` list on the Accomplishment, end to end. See the "`images[]` contract" section of the [spec](../spec.md).

- [x] `career`: frontmatter `images: [{src, alt}]`; validation enforces the folder path `/projects/<id>/<name>.webp` and a non-empty `alt`
- [x] `career`: every Accomplishment with `image` migrated to `images: [{src: /projects/<id>/cover.webp, alt}]`; every `imageAlt` translation key renamed to `imageAlt:cover` (current translations stay current, not stale)
- [x] `career`: `site-export.ts` emits `images` and `SITE_JSON_VERSION = 3`; translation keys for alts are `accomplishment:<id>.imageAlt:<name>`
- [x] site: `public/projects/<id>.webp` moved to `public/projects/<id>/cover.webp` (`git mv`)
- [x] site: `schema.ts` — `images` array, regex allows one folder level, `SITE_JSON_VERSION = 3`; the `Accomplishment` type and its doc comment updated
- [x] site: `localize.ts` picks each alt by `imageAlt:<name>`, falling back to English
- [x] site: `Labs.tsx`, `LabsSlider.tsx`, `FirstDeliveryAndContact.tsx`, `ProjectCard.tsx`, `CurvedGallery.tsx` read `images[0]`; nothing changes visually
- [x] `bake-corpus` / `pack-deploy` still accept the deploy package with the new paths
- [x] New ADR (`docs/adr/0017-…`): a project may carry several screens; the cover is 1200×630, extras are 1200×630 or 630×1200, refused not cropped; files per project folder; alts translated by file name. ADR-0012 gets a line pointing to it
- [x] Tests: schema accepts/refuses paths; localize picks alts by name; `npm test` and `npm run build` pass

## Comments

Done 15/11/2026, uncommitted in both repos.

- `career`: `images` in `schema.ts` (with `imageName`), the loader refuses a screen filed under another project's folder or listed twice (two new fixtures), alts keyed `imageAlt:<name>`, `SITE_JSON_VERSION = 3`. The 10 records and the `pt.json` keys migrated; `npm run translations` reports 99/99 current. The `capture` skill's image section shows the new frontmatter. `npm test` 118 passed, `tsc` clean.
- site: the 10 files `git mv`'d to `public/projects/<id>/cover.webp`; `schema.ts` v3, `localize.ts` picks alts by name, `imageSrc(id, name = 'cover')` and `imageName` in `src/lib/projects/image.ts`, every consumer reads `images?.[0]`. `project:image` writes the cover to the new path. `npm test` 162 passed; `npm run build` passes and `deploy.tar` carries the new paths.
- `npm run lint` is broken independently (`next lint` no longer exists in Next 16).
- **Deploy order:** push `career` and this repo together. The site refuses a v2 `site.json`, and the `career` build reads this repo's `master`.

