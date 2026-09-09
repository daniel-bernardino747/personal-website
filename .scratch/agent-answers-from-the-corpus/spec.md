# The chat answers from the Corpus

**What this is:** the `/chat` page stops pretending. Today it is a
`setTimeout(800)` over five hand-written strings in `src/data/responses.ts`;
it becomes a real agent that answers from the Featured Corpus, behind a rate
limit, with its transcripts kept for seven days.

## Why this is urgent, and not only nice

The site is live at `www.teamdbsolutions.com`. The scripted responses now in
production say, in Daniel's first person, that he enjoys *"exploring new coffee
shops"*, loves *"a good sci-fi novel"*, and works with *"PostgreSQL, Prisma"*
and *"REST/GraphQL APIs"*. None of that came from the Corpus and none of it came
from Daniel — it is scaffold text that was never replaced.

That makes `/chat` the only Render Target in production that violates
[ADR-0003](../../docs/adr/0003-no-fabrication-with-source-traceability.md). It
does so on the same domain whose featured project card sells a résumé generator
built around a non-fabrication invariant. The gap between the claim and the page
is the whole problem; the agent is the fix, and issue 01 is the tourniquet that
goes out first.

## The shape of the thing

The agent is a **Render Target**, not a new source of truth. It reads the same
`getCorpus().featured` that `/achievements` renders — five Accomplishments of
twenty-six — and it holds no facts of its own. What is public is still decided by
`featured`, exactly as
[ADR-0007](../../docs/adr/0007-the-site-gains-a-runtime-on-railway.md) carries
forward from ADR-0006. See
[ADR-0008](../../docs/adr/0008-the-agent-is-a-render-target.md).

Answering needs a server, and the site has none: `output: 'export'` produces
static HTML and nothing else. That comes out. See
[ADR-0007](../../docs/adr/0007-the-site-gains-a-runtime-on-railway.md).

## Revision, 2026-09-09 — the app moves to Railway

The runtime decision originally targeted Vercel serverless functions, on the
reasoning that ADR-0006 would survive untouched. Decoding the `VERCEL_OIDC_TOKEN`
in `.env.local` showed the account is on the **`hobby`** plan, whose terms
prohibit commercial use — and this is a company domain served alongside a `recon`
skill whose output is a commercial approach to a decision-maker. The exposure is
an account suspension on the account hosting the domain used to prospect, not a
technical failure.

Railway was already paid for and carries no such restriction, and it already
holds the Postgres. The app moves there;
[ADR-0007](../../docs/adr/0007-the-site-gains-a-runtime-on-railway.md) supersedes
ADR-0006.

What did **not** change is the invariant. Both of Railway's natural deploy paths
break it — a Git-connected service builds without the Corpus and dies on the
missing Identity, and `railway up` would upload all 26 Accomplishments to the
builder. So the build stays local and only the artefact travels, exactly as
before: `next build` here, a Dockerfile that copies `.next/standalone` and
nothing else, `.dockerignore` guarding `content/` the way `.vercelignore` did.

## Decisions taken (grilling session, 2026-09-04)

| Decision | Value |
|---|---|
| Runtime | Next on Railway, `output: 'standalone'` in a container; `output: 'export'` removed. Revised 2026-09-09 — see below |
| Corpus scope | Featured only (5 of 26), serialised into the image at build time |
| Database purpose | Chat transcripts + rate limiting. Guestbook and lead capture explicitly out |
| Storage | Railway Postgres (already paid for). Neon considered and dropped |
| Deploy | Local `next build`, image copies the artefact only. No push-to-deploy, no Corpus in the builder |
| Hosting | Railway — app and database. Revised 2026-09-09; was hybrid Vercel + Railway |
| Non-fabrication | Free prose, but every Metric quoted as the Corpus's exact string; explicit refusal when the Corpus is silent |
| Model | `claude-sonnet-5`, thinking off, system prompt cached |
| Rate limit | 20 messages per IP per day (salted hash, never the IP) + a global daily ceiling |
| Degradation | Honest message + contact CTA. Never a simulated answer |
| Quick actions | "Fun" replaced by "How was this site built?" |
| Streaming | Real streaming; `Typewriter` survives only for persisted history |
| Retention | Transcripts deleted after 7 days |

### Rejected, and why

- **Whole Corpus in the bundle** — 21 non-Featured records, with employer and
  client metrics, would sit in the deployed image within reach of a prompt. Featured-only
  ships nothing that is not already public HTML on `/achievements`.
- **A system-prompt rule against revealing non-Featured records** — the data
  would already have shipped, guarded by a sentence. It looks safe without being
  safe.
- **Keeping the scripted answers as a fallback** — that is the fabricated text.
  Keeping it means an API outage silently restores the ADR-0003 violation.
- **Redis alongside Postgres** — the right tool for a throughput problem this
  site does not have. One store, one connection string.
- **A separate service for the agent** — it would need its own copy of the
  Corpus, which breaks ADR-0002 far worse than a build-time bundle does.

## Issues

| # | Title | Status |
|---|---|---|
| 01 | The scripted answers come from the Corpus | **done** |
| 02 | Runtime, the agent, and the rate limit | **done** |
| 03 | Chat transcripts, kept for seven days | ready-for-agent |
| 04 | Review the Featured set before the agent speaks it | ready-for-human |
| 05 | Manual setup: keys, database, domain | ready-for-human |
| 06 | The orphaned guestbook page | needs-triage |
| 07 | The hand-written stack lists on the home page | needs-triage |
| 08 | A mock agent for development | **done** |
| 09 | Two streaming bugs: runaway scroll, interleaved answers | **done** |
| 10 | Scope enforcement + Markdown rendering | **done** |
| 11 | Hardening the chat endpoint | origin done; Turnstile awaiting keys |

01 ships alone and needs no infrastructure. 02 is blocked on 05 and should not
merge before 04. 03 depends on 02. 06 is fallout from 02, 07 was found while
verifying 01, and neither blocks anything.
