# 05 — Manual setup: keys, database, domain

**What to do:** everything in this effort that only Daniel can do. Nothing here
is agent work — it needs accounts, billing and a browser.

**Status:** ready-for-human

**Blocks:** 02, and through it 03.

> **Revised 2026-09-09.** Originally this ticket set up Vercel environment
> variables and disconnected Vercel's Git integration. The app moves to Railway
> instead — see
> [ADR-0007](../../../docs/adr/0007-the-site-gains-a-runtime-on-railway.md). The
> Vercel steps are gone; steps 4 and 5 replace them.

> **Do not paste any key or connection string into a chat session.** They go into
> `.env.local` and into the Railway dashboard, both of which an agent can be told
> about without ever seeing the value. `.env.local` is gitignored; keep it that
> way.

## Progress

- [x] Anthropic API key created — Daniel confirmed 2026-09-09
- [x] Railway Postgres provisioned — Daniel confirmed 2026-09-09
- [x] `RATE_LIMIT_SALT` generated and written to `.env.local`
- [ ] everything below

## 1. Anthropic — the spend limit

The key exists. The spend limit is the part that still matters and was not
confirmed: console.anthropic.com → **Billing → spend limit**.

This is not caution theatre. `/api/chat` is a public, anonymous endpoint calling
a paid API. The rate limit in issue 02 is the first defence and the spend limit
is the last one; the last protects the account, only the first protects the site.

Measured after issue 02 went in, not estimated: with the fixed prompt cached,
a turn bills ~15 fresh input tokens plus a 1,904-token cache read, so a
five-turn conversation costs roughly **$0.01** — about **$1 per 100
conversations** on `claude-sonnet-5`. The earlier $4 estimate assumed no cache.
The bill only becomes interesting under abuse, which is what both limits are for.

## 2. `.env.local`

Both values are in place as of 2026-09-09. `DATABASE_URL` needed a detour.

### `DATABASE_PUBLIC_URL` does not exist on this service

The ticket said to copy it from the Railway dashboard. It is not there. Railway
generates that convenience variable only in some cases; this Postgres service has
the TCP proxy enabled (`RAILWAY_TCP_PROXY_DOMAIN`, `RAILWAY_TCP_PROXY_PORT` are
both set) but no `DATABASE_PUBLIC_URL` to go with it. Its own `DATABASE_URL`
points at `postgres.railway.internal`, which resolves only inside Railway.

Rebuild it from the variables that do exist — same credentials and database, the
proxy host and port in place of the internal ones:

```
postgresql://$PGUSER:$PGPASSWORD@$RAILWAY_TCP_PROXY_DOMAIN:$RAILWAY_TCP_PROXY_PORT/$PGDATABASE
```

The Railway CLI reads them without opening a browser:

```
railway variables --service Postgres --json
```

That yields the proxy host and high port for this service. (The values are not
written down here — this repository is public, and a host and port are half of
what an attacker needs against a database whose user is the default `postgres`.)
Then:

```
npm run db:migrate
```

which is idempotent and refuses outright if handed an internal URL.

## 3. ~~Deploy issue 01 to Vercel~~ — no longer possible

**Obsolete as of 2026-09-09.** This step said to ship issue 01 to Vercel first,
so the fabricated answers came off the live domain days before the migration.
That window closed when issue 02 was implemented in the same working tree: it
removed `output: 'export'`, deleted `vercel.json` and `.vercelignore`, and
dropped the `vercel` CLI. The tree can no longer produce a Vercel deployment, and
nothing was committed beforehand to go back to.

The consequence is that the fabricated chat answers stay live on
`www.teamdbsolutions.com` until Railway serves the domain, rather than coming off
first. Nothing else about the plan changed, but the sequencing benefit was lost —
so steps 4 and 5 are now the thing standing between that text and the public, and
worth doing promptly.

Recovering the original order would mean reconstructing the pre-02 tree, running
one Vercel deploy, then restoring — for a few days of difference. Not worth it
unless the domain move is going to be delayed.

## 4. Railway — the app service

Alongside the Postgres already provisioned:

- Create a service for the app. **Do not connect it to the Git repository.** A
  Git build clones a repo with no `content/` and dies on the missing Identity —
  which is the ADR-0002 guard working, and the reason the build stays local.
- Set the service variables: `ANTHROPIC_API_KEY`, `RATE_LIMIT_SALT`, and
  `DATABASE_URL` — here the **internal** URL is correct, since app and database
  share a project.

## 5. The domain move

`www.teamdbsolutions.com` moves from Vercel to Railway. The DNS is **not** inside
Vercel this time — the nameservers are Google Cloud DNS (`ns-cloud-e*.googledomains.com`),
managed through Squarespace, which bought Google Domains. Expect real record
changes and real propagation, unlike the first move.

### The apex cannot be a CNAME, and Squarespace is right to refuse

Railway asks for a `CNAME @` on the root domain. Squarespace rejects it:

> *Os registros CNAME devem ter subdomínios que não sejam o domínio raiz.*

That is not a Squarespace limitation to route around — it is [RFC 1034
§3.6.2](https://www.rfc-editor.org/rfc/rfc1034). A CNAME cannot coexist with any
other record at the same name, and the apex *must* carry SOA and NS. Providers
that appear to allow it (Cloudflare, Route 53) implement a non-standard ALIAS /
ANAME / CNAME-flattening record and resolve it server-side. Google Cloud DNS
through Squarespace does not offer one.

**Decision (2026-09-09): www is the site, the apex redirects.** This is the
arrangement `.scratch/site-shows-the-system/issues/02-publish-on-vercel.md`
already assumed, and the URL in circulation already carries the www. Moving the
DNS to Cloudflare for a real apex was considered and rejected as disproportionate
— it means changing nameservers and re-creating every existing record, with the
risk of dropping MX and taking email down for a redirect nobody sees.

The apex custom domain was therefore **deleted from Railway**; leaving it would
have left a domain permanently stuck in `VALIDATING_OWNERSHIP` against DNS that
can never satisfy it.

### The records to create in Squarespace

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `oqvyaruz.up.railway.app` |
| TXT | `_railway-verify.www` | the `railway-verify=…` value from `railway domain status` |

Both are subdomains, so Squarespace accepts them. A `CNAME www` already existed
pointing at `8qo3x16s.up.railway.app` — the target Railway issued for the apex
before it was deleted — so that record is **edited**, not created. The TXT is new
and is what lets Railway issue the certificate.

Then, separately: Squarespace → domain forwarding, `teamdbsolutions.com` →
`https://www.teamdbsolutions.com`.

### Afterwards

- `railway domain status <domain id>` (from `railway domain list`) until
  `Certificate status` leaves `VALIDATING_OWNERSHIP`.
- Removing the domain from Vercel takes the Vercel deployment off it immediately;
  there is no overlap window. Do that once Railway serves the www.
- This move is what finally takes the fabricated chat answers off the public
  domain — step 3 fell away, so nothing else does it.

## 6. Vercel, afterwards

Once Railway serves the domain, the Vercel project is dead weight — and its Git
integration is still switched on, so every push still triggers a cloud build that
clones a Corpus-less repository and fails. Delete the project, or at minimum
disconnect the repository.

## Acceptance criteria

- [ ] A spend limit is set on the Anthropic account
- [x] `ANTHROPIC_API_KEY` and `DATABASE_URL` are filled in `.env.local`
- [x] The schema is applied (`npm run db:migrate`)
- [x] ~~Issue 01 is live on the current Vercel deployment~~ — dropped, see step 3
- [x] A Railway app service exists (`web`), not connected to Git, with its three
      variables set
- [x] `www.teamdbsolutions.com` serves the Railway service over HTTPS
- [ ] The apex redirects to www — the Squarespace forwarding rule failed to save
- [ ] The Vercel project is deleted or disconnected from the repository

## Comments

**2026-09-09 — `www.teamdbsolutions.com` is live on Railway**, Let's Encrypt
certificate valid (`CN=www.teamdbsolutions.com`, issued 14:25 UTC). All routes
200, unknown path 404, and the agent answered from the Corpus with every Metric
literal. Asked about Cafe Cajuba, Petricar and Shortly — records that exist in
`content/` but are not Featured — it answered "I don't have that recorded" and
named only the five. The invariant holds on the public domain.

### The certificate error that was not an error

Loading the site mid-setup showed `NET::ERR_CERT_COMMON_NAME_INVALID`, with the
browser also refusing to offer a bypass because the domain carries HSTS. It read
like a misconfiguration and was simply Railway's edge answering before it had
issued the certificate for this name. Between seeing that screen and checking the
CLI, the status had already gone `Verified: yes` /
`CERTIFICATE_STATUS_TYPE_VALID`. Nothing was changed to fix it. Worth a minute's
patience before debugging, once the TXT record is in place.

### Still open: the apex

The Squarespace forwarding rule failed to save with a generic *"Ocorreu um
problema ao salvar as alterações. Tente novamente depois."* The form was correct
(`@` → `www.teamdbsolutions.com`, 301, maintain paths). The apex currently
resolves to nothing and returns 404.

Retry it now that the `www` records are settled. Note the warning on that screen —
the rule *deletes* records when it saves — so verify the `www` CNAME and the
`_railway-verify.www` TXT survive it. If Squarespace keeps refusing, the apex
redirect is a convenience, not a blocker; `www` is the URL in circulation.
