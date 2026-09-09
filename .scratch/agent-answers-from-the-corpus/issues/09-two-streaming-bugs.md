# 09 — Two streaming bugs: the runaway scroll and the interleaved answers

**What to do:** fix the chat scrolling the whole page instead of the message
list, and fix two overlapping streams writing into the same bubble.

**Status:** done — deployed 2026-09-09

**Blocked by:** nothing. Both are regressions from issue 02.

## How they were reported

Daniel reported one bug and unknowingly screenshotted a second:

> *"achei um bug que só acontece em produção: estou clicando nas perguntas
> rápidas e o scroll fica jogando tudo pra cima, enquanto está normal em dev.
> Talvez o build no railway tenha causado isso?"*

The build was not the cause of either. Both were in the code and both were
already live; only the conditions for seeing them differed.

## Bug 1 — the runaway scroll

**Symptom.** Clicking a quick action drags the whole page upward, taking the
header out of view.

**Why it looked production-only.** It is a viewport-height bug, not a build bug.
The production screenshot is a 568px-tall window; the dev one is 918px. A tall
window has no document scroll to drag. The real agent also returns markdown with
full URLs written out, so its answers are far longer than the mock's — more text,
more scrolling, on a shorter window.

**Root cause, in two layers.** `scrollToBottom` called
`messagesEndRef.current.scrollIntoView()`, which scrolls *every* scrollable
ancestor including the document. But the reason the document was scrollable at
all is the layer underneath: the message list was `flex-1 overflow-y-auto` inside
a `min-h-screen` column. A flex item defaults to `min-height: auto` and refuses
to shrink below its content, so `flex-1 overflow-y-auto` never actually scrolls —
the list grows, the page grows past the viewport, and the document takes the
scroll instead. Fixing only the `scrollIntoView` call would have left the page
scrollable and the layout wrong.

**Fix.** `h-screen` + `overflow-hidden` on the page wrapper (`chat/page.tsx`),
`min-h-0` on the list, and `container.scrollTo({ top: scrollHeight })` in place
of `scrollIntoView` — a `scrollTop` write cannot touch anything outside its own
element.

## Bug 2 — interleaved answers

Visible in the dev screenshot, unreported:

> *"I'm thoughtful, Daniel performant Bernardino web de experiences. Souza
> Focused — on Fullstack clean Developer, architecture, Software great
> Engineer…"*

That is one answer with a second shuffled into it, word by word.

**Root cause.** `appendToLastMessage` wrote to `messages[messages.length - 1]`.
That is correct only while exactly one stream is running. Click a quick action on
the home page — `AIInput.handleAction` starts the stream *and* navigates to
`/chat` — then click another before the first finishes: stream A opens bubble 1
and starts writing, stream B opens bubble 2, and from that moment "last" is B, so
A's chunks land in B's bubble too.

A second, quieter path to the same failure: message ids came from `Date.now()`,
so two bubbles opened in the same millisecond shared an id.

**Fix.** `appendToMessage(id, chunk)`, addressed rather than positional, with
`useChatMutation` recording the id of the bubble it opened and writing only
there. Ids are now monotonic — `Date.now()`, or the previous id plus one when
that would collide. A chunk for a message that no longer exists (history cleared
mid-stream) is dropped rather than recreating it.

`src/store/useChatStore.test.ts` was written to reproduce the interleaving before
the fix, and covers all four behaviours.

## The Tailwind question, which was the right question

Asked for a build to test against, Daniel suspected the build itself. Worth
checking for one specific reason: if Tailwind had purged `min-h-0` from the
production CSS, that *would* be a genuine production-only bug. It did not —
`.min-h-0{min-height:calc(var(--spacing)*0)}` and `.h-screen{height:100vh}` are
both in the built stylesheet, verified before and after deploying.

**A production build cannot run the mock** (issue 08): `NODE_ENV=production`
disables it before the flag is read, and `next build`/`next start` set exactly
that. That is the guarantee working, not an obstacle to route around. The
production build was served locally with the real API instead — a few cents for a
layout test, against the real artefact.

## Acceptance criteria

- [x] The page does not scroll; only the message list does
- [x] `min-h-0` and `h-screen` survive into the production CSS bundle
- [x] Two overlapping streams keep their text in separate bubbles, with a test
- [x] Message ids do not collide, with a test
- [x] A chunk addressed to a deleted message is dropped, not resurrected
- [x] Verified live on https://www.teamdbsolutions.com — HTML carries
      `h-screen flex flex-col overflow-hidden`, CSS hash matches the local build
- [x] The non-Featured records still do not leak, and `x-chat-mock` is absent
