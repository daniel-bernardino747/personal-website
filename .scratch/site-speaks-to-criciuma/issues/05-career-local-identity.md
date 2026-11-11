# 05 — `career`: the Identity speaks to local clients, and the Encaixai enters the Corpus

**Status:** ready-for-agent (in `career`)

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
