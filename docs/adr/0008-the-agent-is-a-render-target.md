# The agent is a Render Target, behind the Featured gate

The chat agent reads the Corpus and answers questions about Daniel's career. That makes it a Render Target in the sense `CONTEXT.md` defines — an audience-shaped output built from a Selection, differing from a résumé in format and length but never in facts. It is not a second source of truth, and it holds no claims of its own.

Two questions follow from that, and they were decided together.

**How much of the Corpus it sees.** The Corpus holds 26 Accomplishments; five are `featured: true`. The agent is given the Featured set and nothing else — the same `getCorpus().featured` that `/achievements` already renders. The alternative, shipping all 26, would put 21 records Daniel deliberately did not publish — with their employer and client Metrics — into the deployed image, within reach of anyone who asks the right question. A third option, shipping everything but instructing the model not to reveal the non-Featured records, was rejected outright: the data would already have travelled, guarded by a sentence in a prompt. It is the option that looks safe without being safe.

Featured-only has a property neither alternative has: what ships is already public. Those five records are rendered as HTML on `/achievements` today. The agent's knowledge is not a new exposure, it is a new interface onto an existing one. And the gate is the one that already exists — [ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md) states that "what reaches the public is decided by `featured`", and this keeps that true rather than inventing a second visibility flag.

**What it may say.** [ADR-0003](./0003-no-fabrication-with-source-traceability.md) has so far been enforced structurally: every Render Target renders literal Corpus prose, so there was no opportunity to fabricate. A language model generates new text, which is the first time that invariant has to hold behaviourally rather than mechanically. The rule is that prose may be freely composed but **every Metric is quoted as the Corpus's exact string** — never re-derived, never rounded, never aggregated. `~2 hours to 3 minutes` may not become "90% faster", a figure Daniel has never asserted and could not defend. Where the Corpus is silent, the agent says so; "I do not have that recorded" is a correct answer and filling the gap is precisely the failure ADR-0003 exists to prevent.

The consequence for degradation follows directly: when the agent cannot run — rate limit reached, daily ceiling hit, API unavailable — the chat says so and offers a contact route. It never falls back to a canned answer. The canned answers that existed when this was decided were themselves fabrications (`src/data/responses.ts` claimed, in Daniel's first person, an interest in coffee shops and science fiction and a stack the Corpus does not record), so a fallback would have meant an outage silently restoring the violation.

## Consequences

`featured` acquires weight it did not have. It used to decide what appeared on a page most visitors never scroll; it now decides what an agent volunteers to anyone who asks, with the Metric spoken and the Affiliation named. The per-item review that ADR-0006 already required "before each deploy" stops being a formality — and the still-unchecked criterion in `.scratch/site-shows-the-system/issues/02-publish-on-vercel.md` has to be resolved before the agent is live.

The deployed image now carries the Featured records as data, not only as rendered HTML. [ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md) said the host "receives rendered HTML, never the source record", and [ADR-0007](./0007-the-site-gains-a-runtime-on-railway.md) carries that rule forward to Railway; this narrows it rather than reversing it. The records that travel are the ones already published as HTML, and the other 21 still never leave this machine.

Making the agent better by widening its scope is not available. When a question a visitor would obviously ask has no Featured record behind it, the fix is to feature an existing Accomplishment — curation, which is what `CONTEXT.md` says `featured` is — never to hand the agent more of the Corpus, and never to write a record for the occasion.

Visitor text is data, never instruction. It goes in the message turn and never into the system prompt, and nothing a visitor types can widen the agent's scope beyond what was compiled into the bundle.
