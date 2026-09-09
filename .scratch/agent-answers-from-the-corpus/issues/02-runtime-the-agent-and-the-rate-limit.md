# 02 — Runtime, the agent, and the rate limit

**What to do:** move the site to Railway with a real server, put an agent behind
`/api/chat` answering from the Featured Corpus, and put a rate limit in front of
it before it is ever reachable.

**Status:** done — live on https://www.teamdbsolutions.com

**Blocked by:** 05 (the key, the database, the domain).
**Should not merge before:** 04.

> **Revised 2026-09-09.** This ticket originally targeted Vercel serverless
> functions. The Vercel account turned out to be on the `hobby` plan, whose terms
> prohibit commercial use, and the site is a company domain used for prospecting.
> The app moves to Railway, which is already paid for. See
> [ADR-0007](../../../docs/adr/0007-the-site-gains-a-runtime-on-railway.md),
> which supersedes ADR-0006.

## The runtime

`next.config.mjs` loses `output: 'export'` and gains `output: 'standalone'`.

**The deploy is the load-bearing part.** Neither of Railway's natural paths is
usable: a Git-connected service clones a repository with no `content/` and dies
on the missing Identity, and `railway up` uploads the working directory — which
would send all 26 Accomplishments to the builder, strictly more exposure than
Vercel ever had. So:

- `next build` runs **here**, on the machine that holds the Corpus.
- A `Dockerfile` copies `.next/standalone`, `.next/static` and `public`. Nothing
  else. It does not run `next build`.
- `.dockerignore` excludes `content/` and `generated/`, the guard `.vercelignore`
  used to be — if the image build ever tries to read the Corpus, it must fail
  loudly rather than quietly shipping it.
- The Railway service is **not** connected to the Git repository.

Verify the guarantee, do not assume it: after building the image, confirm no file
from `content/` is in any layer.

## What comes out

- `vercel.json` and `.vercelignore` are deleted. With them go `framework: null`
  and the `/:path*` → `/:path*.html` rewrite — two workarounds that cost real
  debugging and exist only to make a static export behave under a builder that
  assumed Next. The diagnosis is preserved in
  `.scratch/site-shows-the-system/issues/02-publish-on-vercel.md`; read it before
  concluding anything about routing, but do not port those keys.
- `vercel` comes out of `devDependencies`.
- `npm run deploy` / `deploy:preview` are rewritten for Railway. Whatever shape
  they take, the build must remain local and inseparable from the deploy — the
  ADR-0006 failure mode of deploying a stale artefact applies unchanged.
- `src/app/api/guestbook/route.ts` **is deleted.** Under `output: 'export'` it
  was excluded from the build, so `/guestbook` already POSTs into a 404 and shows
  its error state. Deleting preserves that; keeping it would turn a `console.log`
  stub into a live public endpoint accepting arbitrary JSON. The orphaned page is
  issue 06, not this ticket.

## The agent

`/api/chat` calls `claude-sonnet-5` through the official `@anthropic-ai/sdk`,
thinking off, streaming on.

**Corpus scope: Featured only.** The route reads `getCorpus().featured` — the
same five records `/achievements` renders — at build time, so the image carries
them. The other 21 never leave this machine. That is the whole safety argument:
what ships is already public HTML.

**Non-fabrication at runtime.** The system prompt carries the Corpus and two
rules that make the agent an honest Render Target:

1. Every Metric is quoted as the Corpus's exact string. Never re-derived, never
   rounded, never summed. `~2 hours to 3 minutes` must never become "90% faster"
   — a number Daniel has never asserted.
2. When the Corpus is silent, say so. "I do not have that recorded" is a correct
   answer; filling the gap is the failure ADR-0003 exists to prevent.

The system prompt is fixed, so mark it `cache_control: { type: "ephemeral" }` and
keep the volatile turn after it. Verify with `usage.cache_read_input_tokens` — a
persistent zero means something is invalidating the prefix. Sonnet 5 does not
support mid-conversation system messages, so every instruction belongs in that
cached top-level prompt. That is where it should be anyway.

## The rate limit

Two layers, because they stop different things:

- **Per visitor** — 20 messages per day, keyed on a **salted SHA-256 of the IP**,
  never the IP itself: a raw address is personal data under the LGPD and the
  counter works identically without it. Salt from `RATE_LIMIT_SALT`.
- **Global** — a daily ceiling (start at 500) across the whole site. The per-IP
  limit does nothing against many IPs; this is the circuit breaker.

Both live in Railway Postgres. Both are configuration, not literals buried in a
handler — they will be loosened once there is real traffic data.

One Railway note: the app and the database are now in the same project, so the
service can use the **internal** `DATABASE_URL` (`*.railway.internal`) rather than
the public one. Local `npm run dev` still needs the public URL.

## Degradation

When the limit is hit, or the ceiling is hit, or the API is down, the chat says
so plainly and offers the contact route from `identity.social`. **It never
returns a simulated answer.** Issue 01 already built this shape for unmatched
questions; reuse it.

## The client

`useChatMutation` stops being a `useMutation`: streaming needs `fetch` with a
`ReadableStream` reader. `useChatStore` gains `appendToLastMessage`.

`Typewriter` is **deleted**, not kept. This ticket originally said to keep it
"only for persisted history", which followed the reasoning right up to the last
step and then stopped: history should render instantly (nobody wants to watch a
conversation they already had be retyped) and live tokens already arrive
progressively. Both branches render immediately, so the component would have
animated nothing — a passthrough is dead code wearing a name. What it did carry
was the scroll driver, through its `onUpdate` callback; that moves into an effect
keyed on the last message's text, which fires on every streamed chunk.

The 400ms placeholder delay left by issue 01 comes out.

## Acceptance criteria

- [x] `output: 'standalone'`; `vercel.json`, `.vercelignore` and the `vercel`
      devDependency are gone
- [x] The image is built from a local `next build` and contains no file from
      `content/` — verified, not assumed
- [x] The Railway service is not connected to the Git repository
- [x] `src/app/api/guestbook/route.ts` is deleted
- [x] `/`, `/achievements`, `/chat`, `/guestbook` and an unknown path all behave
      correctly on the deployed site
- [x] `/api/chat` streams from `claude-sonnet-5` grounded in `featured` only
- [x] A question about a non-Featured Accomplishment gets a refusal, not an
      answer — verified against a record that exists in `content/` but is not
      Featured
- [x] A Metric survives into the answer undistorted, with a test. **Reworded
      during implementation**: "byte for byte" turned out to be the wrong bar —
      the Corpus records this fact twice, as `~2 hours to 3 minutes` in the
      `metric` field and as "about two hours … to three minutes" in the statement
      body, and the agent quotes whichever it likes run to run. Both are literal
      and both are honest. The assertion that carries the weight is the negative
      one: no percentage, no multiplier, no figure Daniel never asserted
- [x] Both limits refuse with the honest message and without calling the model.
      Exercised by setting the limits to zero rather than by sending 21 paid
      requests — same branch, same assertion, no spend
- [x] With `ANTHROPIC_API_KEY` unset, the chat degrades to the honest message and
      the CTA — never to a canned answer
- [x] `usage.cache_read_input_tokens` is non-zero on the second request

## Comments

Implemented 2026-09-09. **Not deployed, and not verified end to end** — see the
open criteria above and the blocker below.

### The hole this ticket did not anticipate

The ticket said the route "reads `getCorpus().featured` at build time, so the
image carries them". It does not. `buildSystemPrompt()` runs on the first
*request*, and `loadCorpus()` reads `content/` from disk — a directory that is
gitignored, excluded from the image, and which the loader treats as a legitimate
empty state. The agent would have deployed knowing nothing, answering every
question with "I don't have that recorded", with no error in any build log.

`scripts/bake-corpus.mjs` closes it, wired into `npm run build`. It copies the
Featured Accomplishments, the Affiliations they reference, and the Identity into
`.next/standalone/content/` — files, not serialised records, so there is no
second reader of the Corpus to drift from `loader.ts`. It exits non-zero if
nothing is featured, because a chat that knows nothing should stop a build rather
than ship.

Measured on this Corpus: `5 featured, 3 affiliations, identity. 21 non-featured
records withheld.` Guarded by `src/lib/agent/baked-corpus.test.ts`, which fails
both ways — too little baked and the agent is empty, too much and records Daniel
withheld are in the image.

### What the live test found

`src/lib/agent/live.test.ts` calls the real API. It is opt-in
(`CHAT_LIVE_TEST=1`), costs about a cent a run, and `npm test` skips it.

Its first run failed, and the agent was right: asked how much faster a tailored
résumé is now, it answered "about two hours … down to three minutes" — the
statement's spelling rather than the `metric` field's `~2 hours to 3 minutes`.
The test demanded digits. Re-running it passed, because the model had picked the
other spelling that time, which made the test non-deterministic as well as wrong.

The finding is worth keeping: **"quote the Metric verbatim" is ambiguous when the
Corpus records the same fact twice in different words.** Both spellings are
literal, so both are honest; the assertion that matters is that no percentage or
multiplier appears. The prompt was not changed — forcing the digit form would buy
a testable string at the cost of prose that reads like a database.

Two assertions passed first time and are the ones worth trusting: asked to list
"absolutely every project including ones not featured", the agent did not leak a
withheld record's metric; asked what Daniel reads for fun, it declined instead of
inventing.

### A defect the unit test caught in the prompt itself

`prompt.test.ts` asserts the refusal phrasing is present. It failed: the sentence
`Say so: "I don't have that recorded."` had been wrapped across two lines inside
the template literal, so the quoted phrase the model was told to use contained a
newline and six spaces. Reflowed.

### Verified

- `npm test` — 72 passed, 3 skipped (the live ones, correctly not billing).
- `CHAT_LIVE_TEST=1 npx vitest run src/lib/agent/live.test.ts` — 3 passed.
- `npm run build` — clean; `/api/chat` dynamic, every page still static.
- The artefact carries 5 of 26 Accomplishments, checked file by file.
- `ANTHROPIC_API_KEY` unset → honest 503 with the contact CTA, no canned answer.

### The blocker, and what it accidentally proved

`DATABASE_URL` in `.env.local` is Railway's **internal** URL
(`postgres.railway.internal`), which resolves only inside Railway's network. So
`npm run db:migrate` has never run, no table exists, and a live request to
`/api/chat` returns:

> `I cannot check my usage limits right now, so I am holding off.` + contact CTA,
> HTTP 503

That is the design working. The limiter stands between a public endpoint and a
paid API, so a limiter that cannot be consulted **fails closed** — no model call,
no spend, an honest message. But it means the streaming path, the rate limit and
the transcripts are all still unproven against a real database.

Unblocking is one paste: the public connection string from Railway (a `*.proxy.rlwy.net` host)
into `.env.local`, then `npm run db:migrate`, then `npm run dev` and use the chat.

### Verified end to end, 2026-09-09

`DATABASE_PUBLIC_URL` did not exist on the Railway Postgres service — see issue
05 for why and how it was rebuilt. With a working connection:

- `npm run db:migrate` — created `chat_global_limit`, `chat_rate_limit`,
  `chat_transcript`.
- A real question returned a streamed 200 in ~7s. Every Metric came back
  undistorted: `7s to 1.5s`, `30%`, `5 teams`, `1,088 active cards`,
  `76.3% (29 of 38)`, `4 days to 1 day`, `200%`, `90 people`, and the résumé
  before/after in the statement's spelling. No invented figure.
- The transcript row stores a 64-character hash, never an address. Both counters
  incremented.
- Per-visitor and global limits each refuse with their own message, 429, without
  reaching the model. Tested by setting each limit to zero — the same branch as
  a real overflow, at no cost.
- Prompt caching works: `cache_read=1904` on consecutive requests, with only the
  question (13 and 16 tokens) billed as fresh input.
- Time to first byte: 2.9s cold, **1.5s warm**.
- Retention (issue 03): a row backdated nine days was gone after the next
  conversation triggered the sweep.

**The cost estimate in issue 05 is now pessimistic.** With the fixed prompt
cached, a turn costs roughly $0.002 rather than the $0.008 the estimate assumed —
closer to **$1 per 100 conversations** than $4.

### One test defect found and fixed

`pkill -f "next dev"` does not kill the dev server on Windows. The first
per-visitor limit test appeared to fail — a 200 with a normal answer — because
the restarted server never started (`Unable to acquire lock`) and curl reached
the old instance, still running the old limits. The code was correct throughout.
Kill the port with PowerShell (`Get-NetTCPConnection -LocalPort 3000`), not
`pkill`, and check the dev log for the lock message before trusting a result.

### Added beyond the ticket

`console.log` of token usage per request (`in`, `out`, `cache_read`,
`cache_write`). It is the only visibility into what a conversation costs, and a
`cache_read` stuck at zero is a silent multiplier on the bill after any prompt
change.

### Deployed to Railway, 2026-09-09 — https://www.teamdbsolutions.com

Live on the real domain, Let's Encrypt certificate valid. The generated domain
`web-production-d3ea9.up.railway.app` still answers alongside it.

Verified against production: `/`, `/achievements`, `/chat`, `/guestbook` all 200,
unknown path 404. The agent answered with every Metric literal. Asked to list
"every single project including ones not featured", naming four records that
exist in `content/` but are not Featured, it answered **"I don't have that
recorded"** and named only the five. The database is writing — transcripts and
counters both moving, through the `${{Postgres.*}}` reference resolving to the
private host.

### Three deploys failed first, all the same mistake

The upload path, not the code. Worth writing down because none of the failures
pointed at their own cause.

**1. `"/.next/static": not found`.** `railway up` filters the upload through
`.railwayignore` *combined with* `.gitignore`, and `.gitignore` contains
`/.next/` — the one directory that must travel. Fixed with negations.

**2. Container died on `Cannot find module 'next'`.** `.railwayignore` said
`node_modules`, unanchored, which matches at every level — including
`.next/standalone/node_modules`, the 38MB of traced production dependencies.
Anchoring it to `/node_modules` was necessary and not sufficient.

**3. Same error again.** Anchoring exposed the wider problem rather than solving
it: `content` was also unanchored, so it would have excluded
`.next/standalone/content` — the baked Featured slice — and shipped an agent that
knew nothing, silently, which is exactly the failure `bake-corpus` exists to
prevent. `src` and `docs` could match paths inside dependencies too.

**The fix was to stop arguing with ignore rules.** `scripts/pack-deploy.mjs`
packs the whole artefact into `deploy.tar`; `.railwayignore` and `.dockerignore`
became whitelists of one file each. A tarball is opaque to every pattern, so what
the builder receives is exactly what was packed. The Dockerfile is a single `ADD`
plus a `RUN test` asserting `server.js`, `node_modules/next` and
`content/accomplishments` are all present — the check that would have caught
failures 2 and 3 at build time instead of at runtime.

`pack-deploy` also hit `tar: Cannot connect to C: resolve failed` — GNU tar reads
an absolute Windows path as `host:path` and tries to open a network connection.
Relative paths with `cwd` work under both GNU tar and the bsdtar in System32. The
original `stdio: 'inherit'` hid the message entirely and surfaced only
`status: 128`, so the script now captures stderr and prints it.

### Still open

- The domain move (issue 05, step 5) — the fabricated answers stay live on
  `www.teamdbsolutions.com` until then.
- `usage.cache_read_input_tokens` was verified locally, not against production.
