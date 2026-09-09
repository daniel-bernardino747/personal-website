# 11 — Hardening the chat endpoint

**What to do:** make `/api/chat` expensive to abuse while keeping it open to
visitors, who are the reason it exists.

**Status:** origin check done; Turnstile implemented and **awaiting keys**

**Blocked on:** Daniel — a Cloudflare account, step 2 below.

## The question, and the honest answer

> *"eu não quero meu endpoint do claude disponível para as pessoas. como eu faço
> para deixar ele seguro?"*

The premise has to be corrected before anything else: **an endpoint a visitor's
browser can call is an endpoint `curl` can call.** There is no way to prove a
request came from "the site". Any secret shipped to the browser is a secret the
visitor has, and any header a browser sends, a script can send. Everything below
raises the cost of abuse. Nothing makes it impossible, short of taking the chat
private — which Daniel considered and rejected, because a chat no recruiter can
open is not a chat.

## The layers, cheapest first

Each runs before the next, so a rejected request costs as little as possible.

**1. Origin (`src/lib/agent/origin.ts`) — live.** Browsers always send `Origin`
on a `fetch` POST, same-origin included, so its absence means the caller is not a
browser. Whole hosts are compared, never suffixes: `endsWith('teamdbsolutions.com')`
would happily accept `evil-teamdbsolutions.com`, and there is a test for exactly
that. `CHAT_ALLOWED_ORIGINS` extends the list without a deploy.

A forged header defeats this in one line of curl. It is the cheapest layer, not
the last one — it removes the casual case: a script pointed at the URL, or
another site embedding the chat on this account's quota.

**2. Turnstile (`src/lib/agent/turnstile.ts`) — implemented, inert.** This is the
layer that costs an automated caller something real: a challenge issued per
visit, which a script cannot cheaply replay. Free, and invisible to nearly every
visitor.

Tokens are **single-use**, so the widget runs per message and resets — a widget
rendered once and read repeatedly would pass the first message and fail every one
after it.

**It is off until configured**, and ships that way deliberately: with no
`TURNSTILE_SECRET_KEY` the server skips the check and the client loads no script.
Turning it on before the keys exist would take the chat down, and a half-finished
defence that breaks the site is worse than the exposure it closes.

**3. Rate limits — live, from issue 02.** 20 messages per visitor per day and a
500/day site ceiling. These are what cap the damage when the layers above are
bypassed, which is the case to design for.

**4. Scope classifier — live, from issue 10.** Refuses tasks, so even a
successful caller cannot use this as a general-purpose LLM.

**5. The Anthropic spend limit — STILL NOT SET.** The only control that acts when
every layer above fails, including a bug in one of them. It is free and takes
thirty seconds, and has been outstanding since issue 05. Nothing here replaces it.

## What Daniel needs to do

**Set the spend limit.** console.anthropic.com → Billing → spend limit.

**Then, for Turnstile:**

1. dash.cloudflare.com → Turnstile → Add widget. Domain
   `www.teamdbsolutions.com`; widget mode **Invisible**.
2. It issues a site key (public) and a secret key (private).
3. Railway → service `web` → Variables:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — the site key. The `NEXT_PUBLIC_` prefix
     is required and correct: this value is meant to be in the page.
   - `TURNSTILE_SECRET_KEY` — the secret key. Never prefixed, never in the page.
4. Put both in `.env.local` too, so `npm run dev` behaves the same.
5. Redeploy — the site key is read at build time.

The site key being public is by design; it identifies the widget. The secret is
what proves a solved challenge, and it stays server-side.

## Verified

- No `Origin` → 403, without touching database, Cloudflare or model.
- Another site's `Origin` → 403.
- A lookalike domain (`evil-teamdbsolutions.com`) → 403.
- An allow-listed origin → 200 with a real answer.
- 8 unit tests on the host matching, including case-insensitivity and the
  localhost rule being development-only.

## Acceptance criteria

- [x] Requests without a browser `Origin` are refused
- [x] Requests from other origins are refused, lookalikes included
- [x] The site's own pages still work
- [x] Turnstile verified server-side when configured, skipped when not
- [x] A fresh token per message
- [ ] Turnstile keys created and set (Daniel)
- [ ] The Anthropic spend limit is set (Daniel) — outstanding since issue 05
