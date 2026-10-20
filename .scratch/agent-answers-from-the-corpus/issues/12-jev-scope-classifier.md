# 12 — Measure Jev against Haiku as the scope classifier

**What to do:** add TypeSafe's Jev as a second scope classifier next to the
Haiku one from issue 10, measure both on the same labeled set, and switch only
if Jev is at least as good.

**Status:** done — deployed 2026-10-20; Jev is the default (ADR-0014)

**Blocked by:** nothing.

## Decisions (grilling, 2026-10-20)

1. **The label is stored.** `chat_transcript` gains `scope TEXT` (nullable,
   `ADD COLUMN IF NOT EXISTS`), holding the label of whichever classifier ran:
   `allow`/`refuse` under Haiku, one of Jev's labels under Jev, `timeout` or
   `error` on a failure.
2. **Contract:** `classifyQuestion(q): Promise<{ verdict, label }>`, where
   `verdict` is still `'allow' | 'refuse' | 'unknown'` and `unknown` passes.
3. **Timeout:** 2,500 ms total for both classifiers, no retries. Haiku had none.
4. **Selector:** `SCOPE_CLASSIFIER=haiku|jev`, default `haiku`; any other value
   counts as unset. Jev without `TYPESAFE_API_KEY` fails open (`error`) and logs
   once.
5. **Labels:** `about_owner`, `about_site`, `small_talk` → allow; `task`,
   `injection`, `other_people` → refuse; `none` → unknown (passes). The visitor's
   text goes only in `state`.
6. **"At least as good":** each case 3 times per classifier. Jev must have zero
   false refusals on legitimate messages, no more leaks than Haiku, p95 latency
   under the timeout. Cost is reported, not gated. Timeouts and errors count as
   passing. A false refusal of a recruiter is worse than a leaked snippet.
7. **Edges of `other_people`:** a person or company for its own sake.
   Employers, clients and a recruiter's own company in relation to Daniel are
   `about_owner`. "How does he compare to other candidates?" is
   `other_people`. Haiku's prompt gets the same clarification.
8. **Measurement:** `scope-cases.ts` (≈40 cases, EN/PT) feeds
   `scope.compare.test.ts` (`SCOPE_COMPARE=1`, each classifier skipped without
   its key) and `live.test.ts`. The table is committed in
   `docs/measurements/`.
9. **Outcomes:** stop with the table either way. If Jev passes and Daniel says
   go: default `jev` + ADR-0014, Haiku kept as rollback. If Jev fails: Haiku
   stays default, Jev stays behind the selector. If Haiku itself refuses a
   recruiter: report, don't patch.

## Manual steps (Daniel)

- Railway: `TYPESAFE_API_KEY`; `SCOPE_CLASSIFIER=jev` only after the switch.
- `npm run db:migrate` against production before deploying this.
