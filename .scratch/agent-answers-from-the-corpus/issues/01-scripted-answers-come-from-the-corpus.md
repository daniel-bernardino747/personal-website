# 01 — The scripted answers come from the Corpus

**What to do:** make the five canned chat answers derive from the Featured
Corpus instead of being hand-written prose about a person who is not Daniel.
No runtime, no database, no API key. This ships under `output: 'export'`
exactly as the site is deployed today.

**Status:** done

**Blocked by:** nothing.

## Why this goes out before the agent

`src/data/responses.ts` is scaffold text that was never replaced. In production
right now it says, in Daniel's first person, that he enjoys *"exploring new
coffee shops"*, loves *"a good sci-fi novel"*, and works with *"PostgreSQL,
Prisma"* and *"REST/GraphQL APIs"*. The Corpus asserts none of it.

So `/chat` is the one Render Target in production that breaks
[ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md) —
on the domain whose featured card sells a résumé generator built on a
non-fabrication invariant. Issue 02 fixes this properly and takes days. This is
the tourniquet, and it costs an afternoon.

The three answers that reference the Corpus already (`Me`, `Contact`) are
mostly fine — they interpolate `identity.name`, `identity.bio`,
`identity.social`. `Projects`, `Skills` and `Fun` are the fabrications.

## The shape

`src/data/responses.ts` is deleted. In its place, `src/lib/corpus/chat.ts`
(`server-only`, beside `site.ts`) derives the answers from the Corpus:

- **Me** — `identity`, unchanged in substance.
- **Projects** — built from `featured`, naming the real titles.
- **Skills** — from the `stack` arrays of the Affiliations behind the Featured
  set, and from what `parseStatement().tech` returns. Never a list typed by hand.
- **Contact** — `identity.social`, unchanged in substance.
- **Fun** — deleted. There is no Accomplishment for it and there should not be
  one; see the quick-action change below.

The root layout already reads the Corpus and seeds `IdentityProvider` for client
components — that file documents the pattern. Follow it: the layout computes the
answers and seeds a sibling provider. It has to be the layout rather than
`/chat`, because `src/components/AIInput.tsx` on the home page consumes the same
answers, and `chat/page.tsx` is a Client Component (it needs `dynamic(…, {ssr:
false})` for the persisted zustand store).

## The quick actions

`ChatContainer.tsx` and `AIInput.tsx` both carry a `Fun` action with a
`PartyPopper` icon. Replace it with a question the Corpus answers better than
any other: **"How was this site built?"** — `personal-website` is Featured,
carries the `~2 hours to 3 minutes` metric, and names the three skills, the
render path and the invariant. The layout of five chips is unchanged; only the
label, icon and phrase move.

Keep the colour key (`pink`) so `chipColorMap` and `colorMap` need no edit.

## Constraints

- The loader is `server-only`. Nothing under `src/lib/corpus/` may be imported
  into a client bundle — the answers cross the boundary as props, like Identity.
- Quote Metrics verbatim. `parseStatement` exists precisely so a card can split
  a statement without inferring anything; use it rather than re-parsing prose.
- An empty Featured set must render a correct, plainer answer — not a crash and
  not an invented one. `/achievements` already has this empty state.
- English, per [ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md).

## Acceptance criteria

- [x] `src/data/responses.ts` no longer exists
- [x] No string in the chat asserts a fact absent from the Corpus
- [x] The `Fun` action is gone; "How was this site built?" is in its place and
      returns the `personal-website` statement's substance, metric included
- [x] `npx vitest run src/lib/corpus` passes
- [x] `npm run build` exports cleanly and `out/chat.html` contains no
      "coffee shops", "sci-fi", or "Prisma"
- [x] Deployed with `npm run deploy` from Git Bash (see ticket 02 of
      `site-shows-the-system` for why not PowerShell)

## Notes

Most of this code is thrown away by issue 02, when answers start coming from the
agent. The part that survives is the quick-action set and the provider seam. That
is an acceptable trade for taking fabricated claims off a live commercial domain
today rather than next week.

## Comments

Implemented 2026-09-04, in the grilling session that produced this directory.

`src/data/responses.ts` is gone. `src/lib/chat/answers.ts` (`server-only`)
derives the five answers from `getCorpus()`; `src/lib/chat/types.ts` holds the
transport type outside the `server-only` boundary so client components can import
it. The root layout seeds `ChatAnswersProvider` beside `IdentityProvider`,
following the pattern that file documents.

The `Fun` chip is gone from both `ChatContainer.tsx` and `AIInput.tsx`, replaced
by **This site** (`Bot` icon, same `pink` colour key, so neither colour map
changed) asking "How was this site built?". `handleQuickAction` and `handleAction`
now key on a stable `id` rather than the visible label, which decouples the chip
copy from the lookup.

Two things changed that the ticket did not ask for, both one-liners:

- The message bubble gained `whitespace-pre-wrap`. Without it the `
` in the
  Projects answer collapsed and the list ran together. It is also what issue 02
  will need when the agent returns formatted prose.
- The simulated delay dropped from 800ms to 400ms. It is placeholder latency
  standing in for a round trip that does not happen yet; 800ms on top of the
  typewriter was gratuitous.

The unmatched-question path is deliberately not a fallback answer: it names the
questions it can answer and gives `identity.social.email`. That is the same shape
issue 02's degradation must take.

Verified: `npx tsc --noEmit` clean, `npx vitest run src/lib/corpus` 43 passed,
`npm run build` exports cleanly. Grepping `out/` for the fabricated terms returns
nothing from the chat — `Prisma` still appears on the home page from
`src/data/stack.ts`, which is a different component and is now issue 07.

**Not deployed.** `npm run deploy` is Daniel's to run from Git Bash — issue 05,
step 5.
