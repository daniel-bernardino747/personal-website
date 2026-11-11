# 07 — The agent answers in the page's language

**Status:** ready-for-agent

**Blocked by:** 04, 05

**What to do:** the chat route receives the page's locale. `prompt.ts` builds from the localized Featured slice and tells the model to answer in that language. The classifier must accept Portuguese questions. Add Portuguese cases to `scope-cases.ts` and run `scope.compare.test.ts`. On `/chat` (PT), the suggested questions (`buildChatAnswers`) are in Portuguese.

- [ ] A Metric is quoted exactly as the Portuguese string from the slice
- [ ] Injection and off-topic cases in Portuguese are still refused
