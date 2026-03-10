# Design Research: pawelszostak.vercel.app

> Researched: 2026-03-10
> Method: WebFetch analysis (browser automation unavailable)
> Subject: Paweł Szostak — Fullstack Developer Portfolio

---

## 1. Site Structure & Navigation

**Type:** Single-page scrollable portfolio with a few sub-pages.

**Top-level nav links:**
| Label | Route |
|-------|-------|
| Home | `/` (anchor) |
| About | `/` (anchor) |
| Projects | `/` (anchor) |
| Skills | `/` (anchor) |
| Other | `/` (anchor) |
| Achievements | `/achievements` |
| Guestbook | `/guestbook` |

**Persistent UI:**
- Sticky/fixed header with nav + "Book a Call" CTA button
- Footer: copyright, Next.js & Tailwind attribution, GitHub / LinkedIn / Email icons
- "Back to home" link on sub-pages

---

## 2. Page Layout & Chrome

**Header:**
- Horizontal nav bar, fixed to top
- Logo/name mark: `PS•`
- Primary CTA: "Book a Call" button (right-aligned)

**Hero Section:**
- Full-viewport or near-full-viewport height
- Animated letter-by-letter typography spelling `P-A-W-E-Ł S-Z-O-S-T-A-K`
- Subtitle: "Fullstack Developer"
- Portrait image with hover interaction
- Scroll prompt: "Scroll to explore"

**Section Flow (homepage scroll):**
1. Hero
2. About (3 feature cards)
3. Skills / Craft (tech badge grid + location)
4. Mindset / Lifestyle (image collage)
5. Projects (numbered 01–04)
6. Guestbook teaser
7. Footer

**Sub-pages:**
- `/achievements` — vertical list of 5 achievement cards (image + text)
- `/guestbook` — centered "Community Wall" with submission form

---

## 3. Design System

### Color Palette
Exact hex values not extractable without browser DevTools, but the observed palette is:

| Role | Description |
|------|-------------|
| Background | White or near-white (`#ffffff` / `#fafafa`) |
| Primary text | Near-black (likely `#0a0a0a` or `#111111`) |
| Secondary text | Medium gray |
| Accent / CTA | Unknown — requires DevTools inspection |
| Borders / dividers | Light gray |

> **Note:** Full hex palette requires browser DevTools or source inspection.

### Typography
| Element | Description |
|---------|-------------|
| Primary font | Sans-serif (likely Inter or Geist via Next.js defaults) |
| Hero heading | Very large, animated, uppercase — display weight |
| Section headings | H2/H3 hierarchy, bold |
| Body text | Regular weight, readable line-height |
| Tech badges | Small, monospace or sans-serif labels |

### Spacing & Layout
- Full-width section containers
- Consistent section padding (generous whitespace)
- Responsive grid: project cards likely 2-col on desktop, 1-col on mobile
- Card-based UI for About section (3 cards) and Projects section

### Buttons & CTAs
| Component | Style |
|-----------|-------|
| "Book a Call" | Primary button — persistent in header |
| "Explore →" | Text link with arrow, used per project |
| "Back to home" | Plain text link on sub-pages |

---

## 4. Interactive Components

| Component | Behavior |
|-----------|----------|
| Hero text | Letter-by-letter animation on load |
| Portrait image | Hover interaction (likely scale or filter) |
| About cards | Hover state (likely lift/shadow) |
| Project cards | Image gallery with multiple screenshots |
| GitHub star icons | Visual badge indicator |
| Guestbook form | Interactive submission area |
| Nav | Sticky on scroll |

---

## 5. Content Templates

### Homepage Sections
- **Hero:** Name animation + portrait + role label + scroll CTA
- **About cards:** Icon/image + heading + 1–2 sentence description
- **Skills:** Tagline + tech badge grid + location block
- **Mindset:** Full-bleed lifestyle image collage + quote
- **Projects:** Numbered (01–04) cards with title, description, tech stack, GitHub link

### Sub-page Templates
- **Achievements:** Page title + tagline + vertically stacked image+text pairs
- **Guestbook:** Page title + tagline + form UI

---

## 6. UX Patterns & Micro-interactions

- **Progressive disclosure:** Single-page scroll reveals story arc (skills → personality → work)
- **Persistent CTA:** "Book a Call" always visible — reduces friction for client contact
- **Numbered projects:** 01, 02, 03, 04 framing adds editorial structure
- **Coordinates + timezone:** Humanizes the location block, signals international availability
- **Lifestyle section:** "Mastering body and mind" narrative differentiates from pure tech portfolio
- **Taglines on sub-pages:** Each secondary page has a unique subtitle adding voice

---

## 7. Visual Design Personality & Tone

**Personality:** Clean, confident, editorial, slightly minimal with personality injections.

**Tone signals:**
- Professional but personal — lifestyle photos alongside technical work
- Ambitious — academic + hackathon + physical achievements all featured
- Modern developer aesthetic — monochrome base with structured typography
- The `PS•` mark adds a subtle brand identity

**Aesthetic keywords:** Minimal · Editorial · Portfolio · Modern · Personal brand

---

## 8. Responsive / Mobile

- Built with Tailwind CSS → responsive by default via breakpoint utilities
- Next.js `<Image>` component used → automatic `srcset` and size optimization
- Single-page scroll architecture suits mobile well
- Navigation likely collapses to hamburger menu on small screens (unconfirmed without browser test)

---

## 9. Technical Framework & Implementation

| Attribute | Value |
|-----------|-------|
| Framework | Next.js (static export) |
| Styling | Tailwind CSS |
| Image handling | `next/image` with optimization |
| Deployment | Vercel |
| Language | TypeScript (inferred from fullstack developer profile) |
| Copyright year | 2026 |

**Inferred architecture:**
- Static export (SSG) — fast load, SEO-friendly
- `/achievements` and `/guestbook` as separate Next.js pages/routes
- Likely uses `framer-motion` or CSS animations for hero text effect
- Guestbook likely backed by a serverless API route or third-party service (e.g., PlanetScale, Supabase, or Vercel KV)

---

## 10. Accessibility

| Criterion | Assessment |
|-----------|------------|
| Heading hierarchy | Appears logical (H1 → H2 → H3) |
| Image alt text | Unknown — requires source inspection |
| Color contrast | Likely passes (dark text on light bg), CTA contrast unverified |
| Keyboard navigation | Unknown — requires browser test |
| Semantic HTML | Likely good (Next.js encourages semantic structure) |
| ARIA labels | Unknown |

> **Grade estimate:** B — strong structural foundation likely, but animated/interactive elements need audit.

---

## Key Takeaways for Design Inspiration

1. **Persistent "Book a Call" CTA** is smart for freelance/client-facing portfolios — consider adopting.
2. **Animated hero headline** creates a memorable first impression at low implementation cost.
3. **Numbered project sections** (01–04) feel more editorial than a plain grid.
4. **Mindset / lifestyle section** is a strong differentiator — shows personality beyond skills.
5. **`PS•` mark** is a minimal personal brand device — simple and effective.
6. **Achievements page** extends the narrative arc beyond just code — worth replicating.
7. **Coordinates + timezone** in the location block is a clever, developer-flavored detail.

---

*Research method: WebFetch HTML/content extraction. Full DevTools-level CSS inspection (exact hex values, computed styles, breakpoints) requires browser automation tools not available in this session.*
