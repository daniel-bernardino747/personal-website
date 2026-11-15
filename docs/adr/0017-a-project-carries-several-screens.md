# A project carries several screens, and the first is its cover

[ADR-0012](./0012-a-projects-image-is-acquired-at-capture.md) gave each project one picture, recorded in the Corpus as `image: { src, alt }`. The project gallery now leads with pictures instead of prose (`.scratch/projects-and-agents/`): the card shows a cover, and the dialog that opens it shows the product in a carousel of screens. One picture cannot do that.

So `image` becomes an ordered list, `images: [{ src, alt }]`. Each entry is acquired, approved and given an `alt` exactly as ADR-0012 describes, because a screen is a claim about the project like any other. Storing the extra screens only in the site, found by a folder convention, was rejected: that would put pictures on the page with no approved, translated `alt` recorded anywhere.

- **The first entry is the cover.** It is what the card, the Labs slider and the Portuguese "Primeira entrega" show, and it stays exactly 1200×630.
- **Extra screens are 1200×630 or 630×1200.** A phone app's screens are portrait, and composing each one onto a landscape canvas wastes most of it. Two fixed sizes keep the carousel predictable and the files pre-sized. A landscape screen must be close to 1.91:1, as the cover is. A portrait one may be anything from 9:21 to 9:16, the span of phone screenshots, and is fitted whole inside 630×1200 with the rest left transparent, so it shows the page's background in either theme. Anything else (a square, a 16:9 desktop capture) is refused rather than cropped, as before.
- **Files live in one folder per project:** `public/projects/<id>/<name>.webp`, the cover as `cover.webp`. The loader in `career` refuses an image filed under another project's folder, or one listed twice.
- **A translated `alt` is keyed by file name**, `accomplishment:<id>.imageAlt:<name>`, not by position. Reordering the screens, or choosing a new cover, then never swaps two translations or marks them stale.

## Consequences

`site:json` moved to version 3, in this repository and in `career` together. Every existing image moved to `<id>/cover.webp` and every `imageAlt` key to `imageAlt:cover`, so no translation went stale.

The images are still site presentation. The résumé, the LinkedIn blocks and `corpus:json` ignore them, so the contract with `prospect-me` is unchanged.

`project:image` writes the cover to the new path, and `--screen <name> --file <path>` adds an extra screen from a file Daniel supplies. Neither replaces an existing file without `--force`, so refreshing a stale image is now a deliberate re-run with `--force`.
