# A classifier that only picks guards the chat's scope

The chat's scope filter (issue 10) asked Claude Haiku 4.5 for one word, ALLOW or REFUSE, before the main agent's answer was allowed through. It exists because the system prompt forbids asserting facts the Corpus does not hold but never forbade performing tasks: in production the agent refused trivia, an explicit injection and a request for its prompt, and still wrote a Python function on request. `/api/chat` is public and anonymous, so a chat that does homework is a free LLM proxy spending the quota a recruiter needs.

The filter now runs on TypeSafe's Jev (`jev-1.13.0`), a model that answers only by picking one option from a list. Haiku stays in the code as the rollback, selected with `SCOPE_CLASSIFIER=haiku`.

**Why Jev.** Both were measured before anything switched, on the same 43 labeled messages in English and Portuguese (`src/lib/agent/scope-cases.ts`), three runs each, with the production timeout and no retries. The full table is in [`docs/measurements/scope-classifier-2026-10-20.md`](../measurements/scope-classifier-2026-10-20.md):

| | Haiku 4.5 | Jev 1.13.0 |
|---|---|---|
| Verdict accuracy | 96.1% | 100% |
| False refusals | 3, all of one recruiter question | 0 |
| Leaks | 2 | 0 |
| Median / p95 latency | 550 / 660 ms | 196 / 233 ms |
| Cost per message | US$0.00033 | US$0.000031 |

The rule for switching was fixed before the first run: zero false refusals of legitimate messages across every run, no more leaks than Haiku, and a p95 under the timeout. False refusals are the hard gate because **a recruiter the filter turns away is worse than a leaked snippet**. The main agent's own rules still refuse most attacks that get past the filter. Nothing catches a recruiter the filter refused. Haiku failed that gate: it refused "Qual a pretensão salarial dele?" on all three runs. Jev passed all three conditions, and was faster and about eleven times cheaper as well. Cost was reported, not gated.

There is a structural reason too. A model that writes can be argued with. A model that only picks a label can at worst pick the wrong one, and it has no way to answer the attacker in prose. Haiku's two leaks were `error` results on two Portuguese `other_people` cases, which failed open. At the time of measurement the code recorded a thrown error and a reply that was neither word under the same label, so which of the two it was is not known. Since then a reply outside the options is recorded as `unexpected`, with its cost, so the next run will show which.

**The labels.** One `choice` question with seven options. `about_owner`, `about_site` and `small_talk` allow. `task`, `injection` and `other_people` refuse. `none` means the filter did not decide, and it passes like a failure does. `task` covers anything the assistant would *do* for the visitor (code, text, translation, summaries, maths, trivia, general knowledge), and mentioning Daniel does not change it: "write a script like Daniel would" is still a task. `other_people` covers a person or company *for its own sake*. Daniel's employers, clients and collaborators, and a recruiter introducing their own company, count as `about_owner`. That edge is where false refusals were most likely, so it is written into the criteria and into Haiku's prompt alike. The instructions and criteria are in English, Jev's main training language. The visitor's message goes only in the `state`, never in the instructions or criteria, so the input being judged cannot steer the judge.

The chosen label is stored with the transcript, in a new `chat_transcript.scope` column. Haiku records `allow`/`refuse`. A failure records `timeout`, `error`, or `unexpected` for an answer outside the options. The 43 cases were written with the same definitions Jev is given, so its 100% is an upper bound. The column is where real traffic tests it.

**Failing open stays.** Any error, timeout or answer outside the options returns `unknown`, and `unknown` passes. The filter is a second layer, and an outage should degrade to the behaviour the prompt alone already had, not take the chat down for everyone. Jev selected without `TYPESAFE_API_KEY` also fails open. It logs once and does not quietly fall back to Haiku, so the misconfiguration shows up as a run of `error` labels rather than hiding. Both classifiers give up after 2,500 ms in total, with retries off. The route waits for whichever comes later, the classifier or the answer's first token, so a limit below that first token costs visitors nothing. Haiku previously had no limit at all.

## Consequences

The chat now depends on a second vendor. A TypeSafe outage weakens the filter but does not take the chat down, and `SCOPE_CLASSIFIER=haiku` switches back without a deploy.

The measured cases are the contract for any later change to the labels, the wording, or the model version. Re-run `SCOPE_COMPARE=1 npx vitest run src/lib/agent/scope.compare.test.ts` and apply the same gate. A case that real traffic shows Jev getting wrong belongs in `scope-cases.ts` before the criteria are reworded to fix it.
