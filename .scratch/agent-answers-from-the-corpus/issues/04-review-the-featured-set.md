# 04 — Review the Featured set before the agent speaks it

**What to do:** read the five Featured Accomplishments as a stranger would, and
decide, per record, whether it should be something an agent volunteers to anyone
who asks.

**Status:** ready-for-human — this is Daniel's judgement, not an agent's.

**Blocks:** 02 should not merge before this is done.

## Why this stopped being optional

`.scratch/site-shows-the-system/issues/02-publish-on-vercel.md` carries this
unchecked criterion:

> - [ ] The Featured set on `/achievements` was reviewed against what should be
>       public under a company domain before the first production deploy

It shipped unchecked. Until now the cost of that was bounded: `featured` decided
what appeared on a page most visitors never scroll, in a layout that does not
argue with anyone.

Issue 02 changes what `featured` means. The Featured set becomes **what the agent
actively tells people**, on request, in conversation, with the Metric spoken
aloud and the Affiliation named. A recruiter will not read `/achievements`; they
will ask the chat "what has he actually shipped" and be told — by name, by
client, by number.

[ADR-0006](../../../docs/adr/0006-deploy-from-the-machine-that-holds-the-corpus.md)
already anticipated this: *"That gate is a per-item decision and must be reviewed
as such before each deploy."* It now needs to happen for real, once, before the
agent goes live.

## What to actually check, per record

- Does its Metric quote a figure belonging to an employer or a client who has not
  agreed to it being public? Revenue, headcount, cost, volume, incident counts.
- Does naming the Affiliation alongside that figure say something the client
  would not say themselves?
- Is it still true, and still work Daniel wants to be asked about?
- Is `featured` doing what `CONTEXT.md` says it does — *curation, not
  classification*, "worth showing today"?

Un-featuring a record removes it from the agent's knowledge entirely; the agent
reads `featured` and nothing else. That is the lever, and it is reversible.

## The other direction

Five records is a thin base for a conversation. If a question a visitor would
obviously ask has no Featured record behind it, the answer is to feature an
existing Accomplishment — not to widen the agent's scope, and not to write a new
record for the occasion. There are 26 in the Corpus.

## Acceptance criteria

- [ ] Each of the five Featured records has been read and kept or un-featured
      deliberately
- [ ] No Featured Metric exposes a client or employer figure Daniel is not
      willing to say out loud on a company domain
- [ ] The unchecked criterion in
      `.scratch/site-shows-the-system/issues/02-publish-on-vercel.md` is ticked,
      with a line in that ticket's Comments recording when and against what
- [ ] The resulting Featured set is what Daniel wants an agent repeating for the
      next year
