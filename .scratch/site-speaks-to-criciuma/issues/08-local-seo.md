# 08 — Local SEO: metadata, JSON-LD, sitemap, hreflang

**Status:** ready-for-agent

**Blocked by:** 06

**What to do:** Portuguese `title` and `description` per page, naming the city and the services (for example "Daniel Bernardino — Desenvolvedor de software em Criciúma, SC"). Set `og:locale` to `pt_BR` / `en_US` with `alternateLocale`, and `alternates.languages` (hreflang `pt-BR`, `en`, `x-default` → `/`). The sitemap lists both languages with alternates. Add JSON-LD on the home page (`ProfessionalService` and `Person`, `areaServed` Criciúma/SC, `address.addressLocality`, `sameAs` for GitHub and LinkedIn) built from the Identity. The OG image gets a Portuguese variant.

- [ ] The JSON-LD validates in Google's Rich Results Test (manual check, noted in Comments)
- [ ] Every page has a canonical URL in its own language
