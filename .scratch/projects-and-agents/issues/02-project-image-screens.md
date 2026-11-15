# 02 — `project:image` appends screens

**Status:** done (not yet committed or deployed), 15/11/2026

**Blocked by:** 01

**What to do:** let `npm run project:image` add a screen to a project, not only set its cover, keeping ADR-0012's rules (acquired at capture, approved by Daniel, never fetched at build, never edits the Corpus itself).

- [x] Without a cover, it acquires the cover as today (og:image → screenshot → `--file`) into `public/projects/<id>/cover.webp`, 1200×630
- [x] A flag (e.g. `--screen <name> --file <path>`) adds an extra screen at `public/projects/<id>/<name>.webp`
- [x] An extra screen is normalised to 1200×630 or 630×1200, whichever is nearer; anything not close to either ratio is refused with a clear message, never cropped
- [x] WebP, quality ~80, through `sharp`, as today
- [x] `<name>` is validated (`[\w-]+`) and an existing file is not overwritten without an explicit flag
- [x] It prints the `images` entry to append to the frontmatter, and the `imageAlt:<name>` key to translate
- [x] The `capture` skill in `career` still calls it by path and keeps working
- [x] Tests for the ratio decision (landscape, portrait, refused)

## Comments

Done 15/11/2026.

- `--screen <name> --file <path>` adds `public/projects/<id>/<name>.webp`; it refuses a project with no cover recorded, the name `cover`, a name outside `[\w-]+`, and `--screenshot` with `--screen`. `--force` is now needed to replace any existing file, the cover included.
- **Deviation from the spec, on purpose:** a real phone screenshot (1170×2532 is 0.46) is far outside 3% of 630:1200 (0.525), so the literal rule would refuse the main use case. A portrait is accepted from 9:21 to 9:16 and fitted whole (`contain`) into a **transparent** 630×1200, never cropped. Landscape keeps the strict rule. Recorded in ADR-0017.
- `screenFit` and `SCREEN_NAME` live in `src/lib/projects/image.ts`, with tests.
- **Found on the way:** `project:image` had been broken on `master` since the i18n work: `source.ts` imported `./localize` without an extension, which plain Node cannot resolve. Fixed with the repo's convention (`./localize.ts`, `./statement.ts`, a relative `../projects/image.ts`).
- Checked by hand: portrait → 630×1200 with alpha; square refused; rerun without `--force` refused; existing cover refused; `../x` refused; no-cover project refused. The test files were deleted afterwards.
- `capture` (in `career`) documents `--screen` and `--force`.

