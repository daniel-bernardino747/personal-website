# 06 — The Portuguese home page: hero, services, process, Elo, guarantees, Encaixai, contact

**Status:** done, except the design review and the Encaixai (not deployed), 12/11/2026

**Blocked by:** 02, 04, 05

**What to do:** the Portuguese home page follows `../copy-pt.md`, in this order: local Hero with the WhatsApp CTA → O que eu faço → Como funciona → Por que é rápido → Você acompanha tudo pelo Elo → Garantias → Encaixai (primeira entrega) → Projetos and trajetória (proof) → Contato. `/en` keeps today's remote-first order and does not get these sections.

**Where each part comes from:**

- Services, WhatsApp, business identity and the Encaixai: from the Corpus (05).
- Process, "por que é rápido", the Elo and the guarantees: site content in `src/content/oferta/pt.ts`. Each guarantee cites its contract clause and the template version it came from (`contratos/modelos/VERSAO`). This is presentation of the offer, not the career record, and it is checked by hand whenever the contracts change version.
- Elo screens and videos: copied from `elo/public/landing/` (fictional client, safe to reuse), under `public/elo/`.

**The guarantees section ships now** (Daniel, 11/11/2026), even with the contract template at `0.1.0`.

- [x] The WhatsApp button opens `wa.me/<number>` with a prefilled message ("Oi, Daniel! Vi o seu site e quero conversar sobre um projeto.")
- [x] The CTA is visible above the fold on mobile, and sticky on mobile after the Hero
- [x] No superlatives ("o melhor de Criciúma") appear (ADR-0003, ADR-0015)
- [ ] The design passes a review (the `impeccable` skill) before deploy

## Comments

12/11/2026.

- `src/app/[locale]/page.tsx`: Portuguese renders LocalHero → Services → HowItWorks (process + "por que é rápido") → EloPortal → Guarantees → FirstDelivery → the proof (BentoAbout, Projects, Labs) → LocalContact, plus StickyWhatsApp on phones. English renders exactly what it did before.
- The offer copy is in `src/content/oferta/pt.ts`, approved in `copy-pt.md`. Each guarantee names its clause, and `CONTRACT_TEMPLATE_VERSION = "0.1.0"`. One change: the line under "Sites (institucionais, landing pages, e-commerce)" repeated the service's name, so it now says what a site is for.
- Services, WhatsApp, service area and company come from the localized Identity. `lib/contact.ts` builds the wa.me link (tested).
- Hero: the chat input (AIInput) left the Portuguese hero, because the agent answers in English until ticket 07. The "Oi, eu sou Daniel Bernardino de Souza" line stays, on one line from tablet up.
- Navbar in Portuguese: Início, Serviços, Como funciona, Projetos, Chat, Contato. The button is "Agendar conversa" → `/agendar` (the Portuguese cal.com event). Before, it pointed at the English event.
- The Elo screens were copied from `elo/public/landing/telas` into `public/elo/` (demo mode, invented client).
- **The Encaixai section renders nothing until `encaixai` exists in the Corpus.** It appears on its own once captured.
- Checked in headless Chromium at 1440 and 390px: no console errors, no 404, no sideways scroll, WhatsApp above the fold on a phone, the sticky button showing after the hero and hiding over the contact section.
- [ ] **Pending:** a design review with the `impeccable` skill before deploy.
