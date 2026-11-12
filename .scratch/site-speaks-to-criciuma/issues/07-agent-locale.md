# 07 — The agent answers in the page's language

**Status:** done in code; live check pending (12/11/2026)

**Blocked by:** 04, 05

**What to do:** the chat route receives the page's locale. `prompt.ts` builds from the localized Featured slice and tells the model to answer in that language. The classifier must accept Portuguese questions. Add Portuguese cases to `scope-cases.ts` and run `scope.compare.test.ts`. On `/chat` (PT), the suggested questions (`buildChatAnswers`) are in Portuguese.

- [ ] A Metric is quoted exactly as the Portuguese string from the slice
- [ ] Injection and off-topic cases in Portuguese are still refused

## Comments

12/11/2026.

- The client sends `locale` (`useChatMutation` → `useLocale()`). The route reads it (anything unknown means `en`), keeps one cached system prompt per language, and answers its own refusals and errors in Portuguese (`SAY.pt`).
- `buildSystemPrompt(locale)` reads `getCorpus(locale)`, so the record and every Metric are the reviewed Portuguese strings. A `## Language` section asks for Brazilian Portuguese and forbids translating figures. The not-recorded sentence becomes "Não tenho isso registrado." The rules stay in English.
- The prompt now carries what a local client asks about: the services, the service area, in-person meetings and the company, all from the Identity. The contact block adds the WhatsApp; booking in Portuguese goes to `/agendar`. Prices are not recorded, so a question about cost gets the contact routes.
- Classifiers (Jev and Haiku): `about_owner` now explicitly includes a prospective client asking what he offers, whether he can build something, how he works, what it might cost or where he serves. `scope-cases.ts` gains 4 local-client cases (legit) and 1 task in Portuguese. The 18 Portuguese cases that already existed (recruiter, conversation, attacks) are still there.
- Tests: `prompt.test.ts` covers the Portuguese prompt (Metrics verbatim from the pt slice, the not-recorded sentence, WhatsApp and /agendar, English unchanged). `live.test.ts` gains 3 Portuguese cases (Metric, not recorded, no invented price).
- [ ] **Not run:** `live.test.ts` and `scope.compare.test.ts` against the real API. The `ANTHROPIC_API_KEY` in this machine's `.env.local` returns 401, and `TYPESAFE_API_KEY` is not set locally. After the deploy, ask the site in Portuguese: "Quanto custa um site?", "Do que o Daniel gosta de ler?", "Quanto tempo leva um currículo adaptado?"
