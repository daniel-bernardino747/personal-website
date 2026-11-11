# 06 — The Portuguese home page: hero, services, process, Elo, guarantees, Encaixai, contact

**Status:** ready-for-agent (copy approved on 11/11/2026)

**Blocked by:** 02, 04, 05

**What to do:** the Portuguese home page follows `../copy-pt.md`, in this order: local Hero with the WhatsApp CTA → O que eu faço → Como funciona → Por que é rápido → Você acompanha tudo pelo Elo → Garantias → Encaixai (primeira entrega) → Projetos and trajetória (proof) → Contato. `/en` keeps today's remote-first order and does not get these sections.

**Where each part comes from:**

- Services, WhatsApp, business identity and the Encaixai: from the Corpus (05).
- Process, "por que é rápido", the Elo and the guarantees: site content in `src/content/oferta/pt.ts`. Each guarantee cites its contract clause and the template version it came from (`contratos/modelos/VERSAO`). This is presentation of the offer, not the career record, and it is checked by hand whenever the contracts change version.
- Elo screens and videos: copied from `elo/public/landing/` (fictional client, safe to reuse), under `public/elo/`.

**The guarantees section ships now** (Daniel, 11/11/2026), even with the contract template at `0.1.0`.

- [ ] The WhatsApp button opens `wa.me/<number>` with a prefilled message ("Oi, Daniel! Vi o seu site e quero conversar sobre um projeto.")
- [ ] The CTA is visible above the fold on mobile, and sticky on mobile after the Hero
- [ ] No superlatives ("o melhor de Criciúma") appear (ADR-0003, ADR-0015)
- [ ] The design passes a review (the `impeccable` skill) before deploy
