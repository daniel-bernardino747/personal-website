# The site speaks to Criciúma, in Portuguese first

Status: needs-triage. Decided in [ADR-0015](../../docs/adr/0015-the-site-speaks-to-criciuma-in-portuguese.md)

## Problem

Daniel wants to be the developer local businesses in Criciúma (SC) think of first. The site cannot get him there today:

- It is entirely in English (`<html lang="en">`, `locale: "en_US"`, interface text hard-coded in components).
- It addresses remote hiring ("Contractor (PJ) / Freelance", "Remote") rather than a business down the road.
- Nothing on it ties it to the city in a way a search engine or a person in Criciúma would notice, even though the Identity already says `Criciúma, Santa Catarina, Brazil`.

## Solution

- **Portuguese at the root, English under `/en`**, with the same paths, `hreflang` alternates, a per-locale `lang` and `og:locale`, and a language switch in the navbar. There is no redirect based on `Accept-Language`.
- **Interface text in dictionaries** (`pt`, `en`) owned by this repository.
- **Corpus text in Portuguese from `career`**: a reviewed translation that `site:json` carries beside the English. A stale or missing field falls back to English and is listed by `corpus:fetch`.
- **The home page in Portuguese leads with local businesses**: what Daniel builds for them, that he is in Criciúma and can meet in person, and how to contact him. Projects and the timeline follow as proof.
- **Local SEO**: Portuguese titles and descriptions that name Criciúma, JSON-LD (`ProfessionalService` or `Person` with `areaServed`), and a sitemap that covers both languages.
- **The chat agent answers in the page's language.**

## Tickets

| # | Ticket | Repo | Blocked by |
|---|---|---|---|
| 01 | Locale routing: PT at the root, EN at `/en` | site | — |
| 02 | The interface text moves into `pt` and `en` dictionaries | site | 01 |
| 03 | `career` produces a reviewed Portuguese translation, and `site:json` carries it | career + site | — |
| 04 | Pages render the Corpus in the page's language | site | 01, 03 |
| 05 | `career`: the Identity speaks to local clients, and the Encaixai enters the Corpus | career | — |
| 06 | The Portuguese home page: hero, services, process, Elo, guarantees, Encaixai, contact | site | 02, 04, 05 |
| 07 | The agent answers in the page's language | site | 04, 05 |
| 08 | Local SEO: metadata, JSON-LD, sitemap, hreflang | site | 06 |
| 09 | Docs: CONTEXT.md, CLAUDE.md, ADR-0005 points to ADR-0015 | both | 08 |

01, 03 and 05 can run in parallel. The Portuguese copy is drafted in [`copy-pt.md`](./copy-pt.md), with the source of every claim.

## Answered (Daniel, 11/11/2026)

1. **Services:** software personalizado, soluções sob medida, aplicativos, automações, agentes de IA, sites (institucional, landing page, e-commerce).
2. **Contact:** WhatsApp first; cal.com as well, with a Portuguese event that Daniel will create.
3. **In person:** yes, in Criciúma and the region.
4. **Business:** DB SOFTWARE SOLUTIONS LTDA (Team DB Solutions), CNPJ 63.169.584/0001-43. The registered office is in Curitiba/PR, so the site does not publish an address and acts as a service-area business.
5. **Local proof:** the Encaixai, Daniel's first delivery, can be shown.
6. **Content sections:** process, speed, the Elo portal, and guarantees taken from the client-security standards in the contracts.

7. **Guarantees:** published now, even with the contract template at `0.1.0`; the legal review finishes before the first real client signs.
8. **WhatsApp:** (48) 99684-4907, a regular WhatsApp account (not Business for now).
9. **Encaixai:** Jadson already uses it; his name and the JADOTEC brand may appear, and "spec to production in two weeks" may be stated.
10. **The services copy** in `copy-pt.md` stays as written.

## Out of scope

- A Portuguese résumé (`/curriculo.pdf`). It can follow later through the same translation path.
- Google Business Profile (as a service-area business, without an address), ChatGPT Business Hub (US-only for now) and other directories. These are set up by Daniel outside the repo.
- The Elo's own landing page, which already exists in the `elo` repo. The site points to it; it does not duplicate it.
- Translating the guestbook or user content.
- Automatic redirects by browser language.
