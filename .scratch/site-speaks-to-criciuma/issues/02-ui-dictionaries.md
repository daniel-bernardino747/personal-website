# 02 — The interface text moves into `pt` and `en` dictionaries

**Status:** ready-for-agent

**Blocked by:** 01

**What to do:** move every interface string that is not Corpus (Hero, Navbar, Footer, section headings, buttons, chat UI, empty states, `/achievements`, `/guestbook`, `ScrollMessage`, `AIInput` placeholders) into typed dictionaries `src/i18n/pt.ts` and `src/i18n/en.ts`. `en` keeps today's text. `pt` is natural Brazilian Portuguese, not a literal translation. Daniel reviews the `pt` file before it ships.

- [ ] A missing key in `pt` is a type error (`en` defines the shape)
- [ ] No hard-coded English remains in components (grep for it in the review)
- [ ] Dates and numbers are formatted with the page's locale
