# Project cards show the project

Status: done — shipped in b3679c4

**What this is:** each project card on the site gains an image of the thing
itself — the site's Open Graph image, a screenshot of it, or an image Daniel
supplies — so the gallery shows the work instead of only describing it. The
card keeps the site's design character; the layout is defined with the
`impeccable` skill once real images exist.

## Decisions (grilling, 2026-09-28)

1. **The image is a fact, acquired at capture.** An optional `image` field in the
   Accomplishment frontmatter. It is fetched once, when the project is captured,
   and Daniel approves it before it is written. The build never touches the
   network. See ADR-0012.
2. **Files live in `public/projects/<id>.webp`, committed.** The image exists to
   be shown on the public site, so versioning it exposes nothing new. The
   frontmatter holds the public path.
3. **Acquisition order: `og:image` → screenshot of `liveUrl` → a file Daniel
   supplies → none.** No GitHub-generated repo cards: they are templates, not the
   project. A card with no image is a first-class state, not a hole.
4. **One script, `npm run project:image -- <id>`.** Reads the `liveUrl` through
   `parseStatement`, fetches `og:image`, falls back to the installed Chrome's
   `--headless --screenshot`, or takes `--file <path>`. Writes the file and
   prints the frontmatter to add; it never edits the Corpus itself. The `capture`
   skill calls it and asks before writing `image:`.
5. **Schema shape: `image: { src, alt }`, `alt` required.** On Accomplishments
   only. Ignored by the résumé, LinkedIn blocks and the letter.
6. **Fixed 1.91:1 (1200×630).** The script rejects anything outside a tolerance
   around that ratio and resizes what passes to exactly 1200×630. A portrait
   mobile screenshot is composed onto a 1200×630 canvas by Daniel first.
7. **Not in `corpus:json`.** `toCorpusJson` already whitelists fields; a test pins
   that `image` stays out. Exposing it later is a deliberate additive change.
8. **Design character.** Untouchable: cursor-tracked glow, year filter with its
   animated pill, the Metric pill, the "You're looking at it" badge, the overall
   visual language (`rounded-3xl`, subtle border, `bg-surface`, eyebrow + drawn
   accent bar). Negotiable: the 3D tilt, the giant index numeral, Featured
   spanning two columns, cascading tech chips, "Read more".
9. **The image is clickable.** It stays content (its `alt` is read); an invisible
   link overlay with `aria-hidden` and `tabIndex={-1}` takes a pointer to
   `liveUrl`, else `repoUrl`, else nothing. The text links remain the accessible
   path.
10. **Normalised at acquisition.** `sharp` (explicit devDependency) writes WebP
    1200×630 at ~q80. The card sets `width`, `height`, `loading="lazy"`,
    `decoding="async"`. Next image optimisation stays off.
11. **Backfill.** The projects whose `liveUrl` yields an image are backfilled in
    this change, alt drafted from what is visible in the image and approved by
    Daniel in one batch. The rest ship without an image.
12. **ADR-0012**, no new CONTEXT term — the image is presentation of one page,
    not shared language.

## Order of work

1. This spec.
2. Schema + loader + tests (including the `corpus:json` exclusion).
3. `scripts/project-image.mjs`.
4. Backfill — **stop for Daniel's approval of images and alts.**
5. `capture` skill learns the image step.
6. ADR-0012.
7. `impeccable` defines the card layout (with-image and without-image states,
   Featured) against real data — **stop for Daniel's approval of the layout.**
