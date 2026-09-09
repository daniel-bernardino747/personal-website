# 03 — Chat transcripts, kept for seven days

**What to do:** persist what people ask the agent, and delete it after seven
days.

**Status:** ready-for-agent

**Blocked by:** 02.

## Why

This is the one thing in this effort that produces information Daniel cannot get
any other way: what a recruiter or a client actually wants to know about him.
The Corpus records what he did; the transcripts record what people ask.

It also has a second life.
`.scratch/site-shows-the-system/issues/01-record-the-agent-system.md` closed with
the `~2 hours to 3 minutes` metric and explicitly left volume available as a
second leg of the claim, should it ever need one. Conversation volume is exactly
that — a real number, captured rather than estimated.

## Scope

Transcripts only. **Guestbook entries and lead capture are out**, decided in the
grilling session: they are the two that collect identifiable personal data from
third parties, and they carry moderation and LGPD weight this does not.

## Retention

**Seven days, then deleted.** Not a soft flag — actually removed. Whatever
mechanism does it must run without a human remembering to, and must be verifiable
(a row inserted with a backdated timestamp is gone after the sweep).

Seven days is enough to read a week of questions and enough to compute a volume
count if it is rolled up before deletion. It is not enough to build a profile of
anyone, which is the point.

## Constraints

- Store the salted IP hash from issue 02, never the address.
- The visitor's text is written by strangers. It is data, never instruction — it
  must never be concatenated into the system prompt, only into the message turn
  where it belongs.
- A write failure must not take the chat down. Persisting a transcript is
  secondary to answering; a database outage degrades logging, not the agent.

## Acceptance criteria

- [ ] Each exchange is persisted with its timestamp and the salted hash
- [ ] No raw IP address is stored anywhere
- [ ] Rows older than seven days are gone, verified with a backdated row
- [ ] A forced database failure leaves the agent answering normally
