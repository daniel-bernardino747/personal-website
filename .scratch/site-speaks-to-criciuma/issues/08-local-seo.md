# 08 — Local SEO: metadata, JSON-LD, sitemap, hreflang

**Status:** done, except the Rich Results Test (not deployed), 12/11/2026

**Blocked by:** 06

**What to do:** Portuguese `title` and `description` per page, naming the city and the services (for example "Daniel Bernardino — Desenvolvedor de software em Criciúma, SC"). Set `og:locale` to `pt_BR` / `en_US` with `alternateLocale`, and `alternates.languages` (hreflang `pt-BR`, `en`, `x-default` → `/`). The sitemap lists both languages with alternates. Add JSON-LD on the home page (`ProfessionalService` and `Person`, `areaServed` Criciúma/SC, `address.addressLocality`, `sameAs` for GitHub and LinkedIn) built from the Identity. The OG image gets a Portuguese variant.

- [ ] The JSON-LD validates in Google's Rich Results Test (manual check, noted in Comments)
- [x] Every page has a canonical URL in its own language

## Comments

12/11/2026.

- `src/lib/seo.ts` (tested): `localeAlternates(path, locale)` returns the page's own canonical, `pt-BR`/`en` hreflang and `x-default` → Portuguese. `shareImage(locale)` and `localBusinessJsonLd(identity)`.
- Layout: the Portuguese home's title is "Daniel Bernardino de Souza — Desenvolvedor de software em Criciúma, SC" and its description names the services and the region (`oferta.seo`). English is unchanged. `og:locale` and `og:locale:alternate` are set on every page. `pageMetadata` takes the locale.
- Share image per language: `src/app/opengraph-image.tsx` became `src/lib/og/share-card.tsx` and is served by `app/og/[file]` as `/og/pt.png` and `/og/en.png`. The Portuguese one carries the local pitch. `/opengraph-image` no longer exists, and the proxy no longer needs to exclude it.
- JSON-LD on the Portuguese home only: `ProfessionalService` with `areaServed` (Criciúma, Santa Catarina) and no `address`, plus `taxID`, `telephone` (WhatsApp), `hasOfferCatalog` (the 6 services) and `founder` (Person, sameAs GitHub and LinkedIn). `<` is escaped as `<` in the script.
- Sitemap: 6 URLs (3 pages × 2 languages), each with its alternates.
- Checked in the dev HTML and with `npm run build`; `npm test` passes 153.
- [ ] **Pending, after deploy:** validate the JSON-LD in Google's Rich Results Test, and submit the sitemap in Search Console.
