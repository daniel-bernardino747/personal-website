# Projects show screens; agents show what they do

Status: needs-triage. Decided with Daniel in a grilling session, 15/11/2026.

## Problem

The project gallery mixes two kinds of work that need opposite treatment:

- **Things with a screen** (ACME, Gestão Nova Casa, Latente…). They are best shown, not described, but the card leads with 3–4 lines of prose and most projects have no image at all (4 of the 14 gallery projects do).
- **Things without a screen of their own** (scholia, Square AI, dont-let-me-forget, Radar Tech). An image explains nothing, and the statement is technical English. A lay visitor reading "a remote MCP server with hybrid search" will not understand that scholia is a second brain.

## Solution

### A new section: Agents (`#agents`)

- **Placement:** `BentoAbout` → `Projects` → **Agents** → `Labs`, in both languages. A navbar link (`Agents`) in English only; the Portuguese navbar stays focused on the offer.
- **Copy:** eyebrow "Agentes de IA" / "AI agents"; title "Sistemas que trabalham sozinhos" / "Systems that work on their own"; lede *"Nem tudo que eu construo tem tela. Estes rodam em segundo plano: lembram, vigiam, conferem. Veja o que cada um faz."* (and its English translation).
- **Membership is a site-side registry** `id → animation`, like `THIS_SITE_ID` and `splitLabs`: a project with a registered animation moves to Agents; one without stays in the projects. `site:json` does not change for this, and `career` does not learn the distinction (presentation belongs to the site, ADR-0013). The résumé keeps calling them projects.
- **Criterion for adding one:** the deliverable has no screen of its own — an AI agent uses it, or it runs unattended. First four, in this order: `scholia-mcp`, `permit-compliance-analysis` (Square AI), `dont-let-me-forget`, `radar-tech-sul-sc`. `plaid-sync-ledger` and `petricar-api` also have no screen but are not AI agents; they stay in the projects unless they get an animation later.
- **Each agent is a full-width band:** a bespoke animation (~60% width on desktop, full width on mobile) looping every ~8–12 s with step captions in sync, beside a one-sentence lay summary and the **Metric** from the Corpus, quoted exactly (ADR-0008). A "Detalhes técnicos" / "Technical details" link opens the same dialog the gallery uses, with the full statement.
- **The lay sentence and the captions live in the site dictionaries** (PT and EN), next to the animation. The Metric still comes from the Corpus.
- **Animations are React + SVG/HTML animated with Framer Motion**: theme tokens from `globals.css`, captions as real text, played when in view (`whileInView`) and paused off-screen. Under `prefers-reduced-motion`, the same steps render as static frames side by side.

Storyboards, to refine per ticket:

| Agent | Story |
|---|---|
| scholia | A conversation happens → a distilled note drops out of it onto a shelf → days later a new question arrives → the right note lights up and returns to the answer. |
| Square AI | A DWG plan and documents go in → items are checked against the law → a ✅/❌/➖ checklist comes out → the engineer stamps the decision. |
| dont-let-me-forget | An idea enters the queue → resurfaces at 1d → 3d → 1w → 2w → 4w → reaches the Wall, where it can only be acted on or archived. |
| Radar Tech | Meetup, Sympla and SATC drop messy events → a funnel merges duplicates and normalises → a clean Telegram post comes out, then the reminder. |

### Projects: images over text

- **The gallery shows only projects with an image.** The card shows cover, title, year and a Live / Code badge — **no prose, no stack**. The CurvedGallery stays; if four cards on the band look too repetitive, a static grid is a separate follow-up.
- **The year filter goes.**
- **The dialog opens with a carousel of screens**, then the full statement, stack and links.
- **Projects without an image** go to a compact "Outros projetos" / "Other projects" list under the gallery: title · year · up to 3 technologies. A row opens the same dialog (no carousel).

### The `images[]` contract (both repos)

- `image?: {src, alt}` becomes `images?: {src, alt}[]` in the Accomplishment; `SITE_JSON_VERSION` 2 → 3 in `src/lib/corpus/schema.ts` here and `src/corpus/site-export.ts` in `career`.
- **The first image is the cover**, exactly 1200×630 (it feeds the grid). **Extra screens** are 1200×630 landscape or 630×1200 portrait; anything near neither is refused, not cropped. In the carousel a portrait screen is centred at the slide's height.
- **Files live in a folder per project:** `public/projects/<id>/<name>.webp`. The schema regex allows that one level.
- **Translations key each alt by file name:** `accomplishment:<id>.imageAlt:<name>`, so reordering screens never invalidates or swaps a translation.
- **Migration:** every current `public/projects/<id>.webp` becomes `public/projects/<id>/cover.webp`, and every `imageAlt` key becomes `imageAlt:cover`. No translation is lost.
- `project:image` learns to append a screen to an existing project (same acquisition order and approval as ADR-0012).
- Labs (`Labs.tsx`, `LabsSlider.tsx`) and the Portuguese "Primeira entrega" (`FirstDeliveryAndContact.tsx`) use `images[0]`, unchanged in behaviour.
- A new ADR extends ADR-0012.

## Tickets

| # | Ticket | Repo | Blocked by |
|---|---|---|---|
| 01 | The `images[]` contract, migration and ADR | career + site | — |
| 02 | `project:image` appends screens | site | 01 |
| 03 | The gallery shows screens; text-only projects become a list | site | 01 |
| 04 | The Agents section, with scholia's animation | site | — |
| 05 | Square AI's animation | site | 04 |
| 06 | dont-let-me-forget's animation | site | 04 |
| 07 | Radar Tech's animation | site | 04 |
| 08 | Docs: CONTEXT.md and CLAUDE.md | site | 03, 04 |

Order of delivery: 01 → 02/03, then 04 → 05 → 06 → 07. 04 does not depend on 01–03. Every push to `master` deploys (ADR-0016), so each ticket must leave the site whole: until an agent has its animation it stays in "Other projects".

## Out of scope

- Producing images for the projects that have none (Café Cajubá app and panel, BaixarMusica…). That is `project:image` work after 02; a project rises into the gallery on its own once its cover is recorded.
- Extra screens for the four projects with a cover. Same: content work after 02.
- A `tagline` field in the Corpus.
- Video, Lottie or Rive animations.
- Replacing the CurvedGallery with a grid (only if 03 shows the band is too repetitive with few cards).
