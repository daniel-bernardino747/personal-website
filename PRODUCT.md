# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a prospective client hiring Daniel as a contractor (PJ) or freelancer — often arriving from a direct approach made after a demo was built for them, or by referral. They are judging whether Daniel ships real products end to end. Secondary: recruiters and hiring managers arriving from a résumé or LinkedIn, scanning for seniority.

## Product Purpose

The public site of Daniel Bernardino de Souza, fullstack and AI developer. It is one Render Target of the career Corpus (`CONTEXT.md`): every fact it shows comes from the `career` repository through `site:json` (ADR-0013). It exists to show the work and turn a visit into a conversation (the booking link, the chat agent at `/chat`).

For the Projects section specifically, success is the visitor opening a project live — the click out to the real thing is the conversion.

## Positioning

Nothing on the site is claimed without a source: Accomplishments carry a Metric or are shown as plainly unmeasured, and the chat answers only from the Featured Corpus. The site is itself a project in its own gallery ("You're looking at it").

## Capabilities and Constraints

- Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Framer Motion; built locally and shipped as a standalone image to Railway (ADR-0007). The build never fetches from the network.
- Light and dark themes (`next-themes`, `.dark` class).
- Project images are 1200×630 WebP in `public/projects/`, recorded in the Corpus with required alt text (ADR-0012). Many projects have no image; a card without one is a first-class state.
- The Corpus is written in English (ADR-0005); the site is in English.

## Evidence on Hand

- 16 project Accomplishments, 7 with an image (5 conceptual demos under `labs.teamdbsolutions.com/demo/*` with editorial Open Graph cards in Portuguese; screenshots of Latente and Eternizar). Several drafts have no Metric.
- No testimonials, client logos or case-study pages exist; none may be invented.

## Product Principles

- Show, don't claim: a project is shown as it is, or described plainly — never embellished.
- The work leads; the interface frames it.
- Honest empty states: absence (no image, no metric, no link) renders as a complete card, not a gap.
- Evolution over replacement: returning visitors should recognise the site.

## Accessibility & Inclusion

Keyboard focus rings on every interactive element, `prefers-reduced-motion` respected on all motion, alt text required for every project image, 44px minimum touch targets (existing `min-h-11` convention).
