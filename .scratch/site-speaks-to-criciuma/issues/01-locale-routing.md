# 01 — Locale routing: PT at the root, EN at `/en`

**Status:** done (not yet committed or deployed), 11/11/2026

**Blocked by:** nothing.

**What to do:** serve every page in two languages with the same paths: `/`, `/achievements`, `/chat`, `/guestbook` in Portuguese, and `/en`, `/en/achievements`… in English. Use an `app/[locale]` segment with Portuguese rewritten from the root (a `proxy.ts` in Next 16), or another approach with the same URLs. Choose the smaller one and justify it in a comment. `/api/*`, `/resume.pdf`, images and `opengraph-image` stay unprefixed.

- [x] `<html lang>` is `pt-BR` on Portuguese pages and `en` on English ones
- [x] `/pt/...` is never a public URL: it either 404s or redirects to `/...`
- [x] Nothing redirects based on `Accept-Language`
- [x] Navbar links keep the current language, including the `/#section` anchors (`/en#projects`)
- [x] The navbar has a switch to the same page in the other language
- [x] A test covers the locale resolution (path → locale)

## Comments

Done 11/11/2026 on the `site-speaks-to-criciuma` branch.

- The pages moved to `src/app/[locale]/` (`layout`, `page`, `achievements`, `chat`, `guestbook`), with `generateStaticParams` for `pt`/`en` and `dynamicParams = false`. `/api`, `/resume.pdf`, `robots`, `sitemap`, `opengraph-image` and the icons stayed at the root.
- `src/proxy.ts` (the Next 16 convention) applies `routePath` from `src/i18n/routing.ts`: it rewrites `/x` to `/pt/x`, redirects `/pt/x` to `/x` with a 308, and leaves `/en/*` and files alone. `src/i18n/client.ts` provides `useLocale`, `useSitePath` and `useLocaleHref`.
- A trap worth recording: an escaped dot in the `matcher` (`.*\..*`) loses its backslash when compiled, and the proxy then ran only on `/`. The extension check now lives in `routePath`, with a test.
- Checked with `npm run build` and `next start`: `/`, `/chat`, `/achievements` and `/guestbook` → 200 `pt-BR`; `/en/*` → 200 `en`; `/pt`, `/pt/chat` → 308; `/fr`, `/en/fr` → 404; files → 200. The navbar is gone on `/chat` and `/en/chat`, and the switch points to the same page in the other language. `npm test` 145 passed.
- Not checked: hydration in a real browser (no console open), and client-side navigation between languages.
- **Do not deploy before 08:** the canonical URLs from `pageMetadata` do not yet know the language, so `/en` would declare `/` as its canonical.
