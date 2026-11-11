# 02 — The interface text moves into `pt` and `en` dictionaries

**Status:** done (not committed)

**Blocked by:** 01

**What to do:** move every interface string that is not Corpus (Hero, Navbar, Footer, section headings, buttons, chat UI, empty states, `/achievements`, `/guestbook`, `ScrollMessage`, `AIInput` placeholders) into typed dictionaries `src/i18n/pt.ts` and `src/i18n/en.ts`. `en` keeps today's text. `pt` is natural Brazilian Portuguese, not a literal translation. Daniel reviews the `pt` file before it ships.

- [x] A missing key in `pt` is a type error (`en` defines the shape)
- [x] No hard-coded English remains in components (grep for it in the review)
- [x] Dates and numbers are formatted with the page's locale

## Comments

**What moved.** `src/i18n/en.ts` holds today's English verbatim and defines the shape (`Dictionary` widens every string, so `pt` may differ); `src/i18n/pt.ts` is `pt: Dictionary`; `src/i18n/dictionary.ts` exports `getDictionary(locale)`. Client Components read it through `useDictionary()` from `src/components/DictionaryProvider.tsx`, seeded in `app/[locale]/layout.tsx` beside `IdentityProvider`. The provider is seeded with the *locale*, not the dictionary: the dictionary holds functions (text that interpolates), and functions cannot cross from a Server Component into a Client Component's props. Both dictionaries therefore ship in the client bundle; they are small.

Top-level keys: `skipLink`, `nav`, `footer`, `hero`, `questions` (chip label + suggested phrase per chat answer id, shared by `AIInput` and `ChatContainer`), `aiInput`, `bento`, `projects`, `labs`, `chat`, `achievements`, `kinds`, `guestbook`, `meta`.

Covered: Navbar (labels, aria-label, booking button), Footer (text and aria-labels), the skip link, Hero greeting, ScrollMessage, AIInput (chip labels, the empty-box fallback `Hi`/`Oi`), every bento card, Projects, ProjectCard, Labs, LabsSlider, ChatHeader, ChatContainer, the client-side chat error replies in `useChatMutation`, `/achievements`, `/guestbook`, and the titles and descriptions of `/chat` and `/achievements` (plus the share image's alt, which `pageMetadata` now takes as `imageAlt`).

- Bold words inside a sentence are marked `**…**` in the dictionary and rendered by `src/components/ui/Emphasized.tsx`, so Portuguese can put the emphasis where its word order lands it.
- `KIND_LABELS` moved from `lib/corpus/schema.ts` (and its re-export in `lib/corpus/index.ts`) into the dictionary as `kinds`, still checked against `Kind` with `satisfies Record<Kind, string>`.
- `displayPeriod(period, now)` takes the word for a running period (`now` / `hoje`); its test passes `'now'` and gains a `'hoje'` case.
- `buildChatAnswers(corpus, locale = 'en')` takes the phrases from the dictionary. The default keeps `lib/agent/mock.ts` (out of scope, ticket 07) working unchanged.
- The Labs board month is now `Intl.DateTimeFormat` with the page's locale (`INTL_LOCALE` in `routing.ts`: `pt-BR` / `en-US`), upper-cased without the dot: `SEP 2026` in English as before, `SET 2026` in Portuguese.
- The Projects year filter's sentinel is now the internal value `"all"`, and its label (`All` / `Todos`) comes from the dictionary.

**Left in English, deliberately.**
- The `response` texts in `lib/chat/answers.ts`: only the development mock (`CHAT_MOCK`) reads them, and what the agent says is ticket 07.
- The plain-text error replies in `app/api/chat/route.ts` (403/400/413/429/503): the route does not know the page's language until ticket 07 sends it.
- `lib/corpus/statement.ts` has no display labels: `Built with`, `Live:` and `Repo:` are markers parsed out of Corpus statements. Surprise for ticket 03/04: a Portuguese statement from `career` must keep those English markers (or the parser must learn Portuguese ones), or the cards lose their tech chips and links.
- The `/achievements` date is shown as the Corpus records it (ISO `2024-03-15`), which is not formatted text; formatting it would change the English page too.
- The coordinates and `GMT-3` in BentoLocation, `labs.teamdbsolutions.com`, tech names, and the `pt`/`en` switch label.
- `About.tsx`, `Skills.tsx`, `Mindset.tsx` (unused), `opengraph-image.tsx` (ticket 08), `lib/agent/**` (ticket 07).

**For Daniel's review of `pt.ts`.** Choices worth a second look: `Get it off the ground` → `Tirar do papel` (idiom for the same thing; `Agendar uma conversa` is the plainer alternative); the chip `Skills` → `Stack` (`Habilidades` may overflow the 80px chip on phones); `Craft` → `Ofício`; `Building scalable apps…` → `Crio apps, sites e automações que crescem junto com o negócio` (says "scalable" in plain words); `You're looking at it` → `Você está aqui`; `Let's Connect` and `Let's talk` both → `Vamos conversar`; `Is he available for hire?` → `Ele está disponível para projetos?`; the résumé is English only, so its labels say so (`Currículo em PDF (em inglês)`, `Currículo completo (EN)`).

**Also noticed.** The suggested phrases now go to the agent in Portuguese on `/`; until ticket 07 the agent answers in English (and its scope classifier has only seen English questions).

