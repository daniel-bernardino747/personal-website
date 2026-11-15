# 03 — The gallery shows screens; text-only projects become a list

**Status:** done (not yet committed or deployed), 15/11/2026

**Blocked by:** 01

**What to do:** make the Projects section lead with images. See "Projects: images over text" in the [spec](../spec.md).

- [x] The gallery (CurvedGallery) receives only projects with at least one image
- [x] The card shows cover, title, year and a Live / Code badge when the statement has the link. No prose, no stack, no "read more"
- [x] The year filter and its dictionary strings are removed; order stays newest first
- [x] The dialog opens with a carousel of all `images`: keyboard and button navigation, a position indicator, swipe on touch; portrait screens centred at the slide's height without stretching; a single image shows without carousel controls
- [x] Below the carousel: the full statement, stack and links (what the card showed before)
- [x] Projects without images render as an "Outros projetos" / "Other projects" list under the gallery: title · year · up to 3 technologies; a row is a button that opens the same dialog, without carousel
- [x] Projects in the Agents registry (ticket 04) are excluded from both, once it exists; until then nothing extra is needed
- [x] `THIS_SITE_ID` still marks the personal website wherever it lands
- [x] Reduced motion: no autoplay in the carousel
- [x] Checked in a browser in PT and EN, light and dark, mobile width

## Comments

Done 15/11/2026.

- `splitGallery` (`src/lib/projects/gallery.ts`, tested) sends projects with a cover to the band and the rest to "Outros projetos" / "Other projects", newest first.
- The band card is cover + year + Live/Code badge + title + "Ver projeto". `CARD_RATIO` went from 1.2 to 0.76 (400×304), since the card no longer carries prose.
- The year filter and its strings are gone (`all`, `filterAria`, `shown`), as are `readMore`, `showLess` and `about`. New: `view`, `others`, `screens`, `screen`, `previousScreen`, `nextScreen`.
- `ProjectCard.tsx` is gone. `ProjectDialog.tsx` is the shared dialog, owned by the section (the band takes `onOpen` and `holding`), and holds `THIS_SITE_ID`. Ticket 04 reuses it for "Technical details".
- `ScreenCarousel.tsx`: buttons, dots, arrow keys and swipe; no autoplay at all; reduced motion swaps instantly. The stage turns `min(62vh, 520px)` tall once any screen measures as portrait, and every screen is `object-contain`. The dialog background became opaque (`bg-background`): `--surface` is a 5% tint, and the transparent sides of a portrait screen showed the page through.
- **Fixed on the way:** `parseStatement` split the stack at every comma, so "PostgreSQL (pgvector, full-text search)" became two broken chips. It now ignores separators inside parentheses (tested). The same parser in `career` was not checked.
- Checked in Chrome: EN and PT, dark and light, a 375px frame (no horizontal scroll), the dialog from the band and from the list, and a temporary 3-screen set on ACME (landscape, portrait, landscape) navigated by button and keyboard. The test screens and the frontmatter edit were reverted, and translations are 99/99 current.
- Not checked: a real touch swipe, and VoiceOver/NVDA.

