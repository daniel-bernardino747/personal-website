# 05 — `career`: the Identity speaks to local clients, and the Encaixai enters the Corpus

**Status:** partly done, 11/11/2026. The Identity is done; the Encaixai capture is pending (Daniel, in a session in `career`)

**Blocked by:** nothing (it ships together with the `SITE_JSON_VERSION` bump in 03)

**What to do (in `career`):**

- The Identity gains:
  - `services[]`: Software personalizado, Soluções sob medida, Aplicativos, Automações, Agentes de IA, Sites (institucional, landing page, e-commerce)
  - `serviceArea`: Criciúma e região
  - `inPerson: true`
  - `whatsapp`: +55 48 99684-4907 (a regular WhatsApp account)
  - `business`: name `Team DB Solutions`, legal name `DB SOFTWARE SOLUTIONS LTDA`, CNPJ `63.169.584/0001-43`
  - `availability.workMode`: no longer just "Remote"
- `site:json` publishes `whatsapp` (today `social.phone` is filtered out). It does not publish the street address: the registered office is in Curitiba/PR.
- Capture the **Encaixai** with `capture` as a project: a DB product, with Jadson (JADOTEC) as a validation partner (contratos decisão 24). Its image comes from `encaixa/promo/encaixai` through `project:image` (ADR-0012). Mark it Featured.
- The `bookingUrl` points to the Portuguese cal.com event once Daniel creates it. A `bookingUrlEn` keeps the current event for `/en`.

- [ ] Nothing in the Identity is invented: every field comes from Daniel or from `contratos/empresa.yaml`
- [ ] The tests in `career` cover the new fields and the WhatsApp gate

## Comments

11/11/2026. In `career`: `34a83a6` (schema) and `d9b21da` (data).

- `social.whatsapp` is a separate field from `phone`, chosen by Daniel: `phone` (added the same morning for the résumé header) stays stripped from `site:json`, and `whatsapp` is published.
- The Identity has `services` (in English, per ADR-0005; the Portuguese comes from the translation), `serviceArea: Criciúma and the surrounding region`, `inPerson: true`, and `business` (name, legal name, CNPJ, no address). `workMode` is now "Remote, or in person in Criciúma and the surrounding region".
- The site's schema accepts the new fields. Nothing renders them yet: that is ticket 06.
- **Pending:**
  - [ ] Capture the Encaixai (`capture` in `career`), with its image from `encaixa/promo/encaixai`, marked Featured.
  - [ ] A Portuguese cal.com event: a `bookingUrlPt` (or similar) once Daniel creates it.
