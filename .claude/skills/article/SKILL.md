---
name: article
description: >-
  Write a long-form Article for the site — a case study that goes deep on work
  already in the Corpus, or a technical essay — through an interview, in
  English, in Daniel's voice. Use when Daniel wants to write up a project, explain
  a decision or a failure at length, turn an Accomplishment into a story, or
  argue a technical position. Writes `../career/corpus/articles/<slug>.md` as a draft;
  only Daniel marks one ready. Never invents a fact, a number or an outcome.
---

# Article

An Article is the long form the rest of the site cannot hold. A résumé bullet
says "page load 7s → 1.5s"; a project card says it with a stack; an Article says
what was slow, what was tried first and failed, why the fix was the fix, and what
it cost. That is the part a recruiter or client cannot get anywhere else, and
the part that shows how Daniel thinks.

Read `CONTEXT.md` for the vocabulary before starting. An Article is not an
Accomplishment: an Accomplishment is a provable claim with a Metric, the atomic
unit a résumé selects. An Article is prose built *on* Accomplishments (a case
study) or on a position Daniel holds (an essay). When an Article is published
and earns its own number — reads, a talk it became — that result is captured
separately, by `capture`, as a `writing` Accomplishment.

There is no page for Articles yet, on purpose. The page gets built once enough
of them are `ready` to be worth a page. Until then this document is the format's
only authority; when the page lands, its schema in `src/lib/` becomes the
authority and this skill must be updated to match it.

## The one rule that overrides everything

**Never invent a fact, a number, or an outcome Daniel did not assert.** This is
[ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md),
and long-form writing is where it is easiest to break: a paragraph wants a
detail, and a plausible one is always at hand. Concretely:

- **Metrics are quoted from the Corpus exactly as written.** "~2 hours to 3
  minutes" stays that, never "about 97% faster". No rounding, no combining two
  records into a new figure.
- **Every other fact about Daniel's work comes from the Corpus or from this
  interview.** What he tried, what broke, who decided, how long it took: ask. If
  he does not know, the Article says so or leaves it out.
- **Do not fill a scene.** "It was 2am and the pager went off" is a detail that
  did not happen unless he said it did.
- **External facts carry a link.** A claim about a library, a benchmark, a
  company or a standard names its source inline, so a reader can check it.
- **A new provable result is a Corpus fact first.** If the interview surfaces a
  number that is not in the Corpus ("it also cut the bill by a third"), stop and
  offer to record it with `capture` before it appears in the Article. The Corpus
  is the single source of truth; an Article must never be the only place a
  number lives.

If you are unsure whether a detail was asserted or inferred, treat it as
inferred and ask.

## Where files live

```
../career/corpus/articles/<slug>.md
```

`career` is a private repository (ADR-0013), so a draft stays private until the
page exists and the Article is `ready`. Paths are relative to this checkout.

Not `../career/posts/`: that folder belongs to the `post-forge` skill and holds
LinkedIn/X drafts with its own layout (scores, alternative hooks, notes). The
two meet in one direction only: a `ready` Article can be handed to `post-forge`
to become a post that links to it. Never paste a post into an Article.

The slug is short kebab-case from the idea, not the headline: `homeet-latency`,
`why-the-model-never-writes-latex`. List the folder first and do not collide
with an existing file unless you are revising it.

## The file

```markdown
---
title: "Seven seconds to one and a half"
summary: "What made Homeet's page load take 7s, and the fix that took it to 1.5s."
date: "2026-09-23"
kind: case-study
status: draft
sources:
  - homeet-performance
tags: [performance, nextjs]
---

The article body, in Markdown.
```

Field notes:

- **`title`** — the headline. Specific over clever. No colon splitting it into a
  title and a subtitle.
- **`summary`** — one sentence, under ~160 characters. It will be the listing
  blurb and the share-card description, so it must stand alone and must not
  promise more than the body delivers.
- **`date`** — the day the text was last substantially written, quoted so YAML
  keeps it a string. Never a guess; use today's date when writing.
- **`kind`** — `case-study` or `essay`.
- **`status`** — `draft` or `ready`. **This skill always writes `draft`.** Only
  Daniel moves an Article to `ready`, after reading the final text; do it for
  him only when he says so in the conversation, never because the text feels
  finished. `ready` is what the future page will publish.
- **`sources`** — the Accomplishment ids (filenames in
  `../career/corpus/accomplishments/`) the Article draws facts from. **Required and
  non-empty for a case study.** Optional for an essay, and listed whenever the
  essay uses his work as an example. This is the audit trail: checking the
  Article is opening these files.
- **`tags`** — optional, a few lowercase topics. Do not invent a taxonomy; reuse
  tags already present in other Articles when they fit.

## The two kinds

### Case study

Goes deep on one piece of work (occasionally two that belong together). Start
from the records: read every Accomplishment in `sources` and its Affiliation.
The record gives the what and the number; the interview gives everything else.
Ask, one at a time and only for what the record lacks:

1. **The problem, as it looked before.** What was wrong, for whom, how anyone
   noticed.
2. **The constraints.** Time, team, budget, legacy, what could not change.
3. **What was tried first.** Especially what failed. A case study where the
   first idea worked is a changelog.
4. **The decision.** What he chose, what he rejected, and why.
5. **What it cost or broke.** The trade-off paid for the result.
6. **His part.** What he personally did, as `capture` asks — so the prose
   credits him honestly when the work was a team's.
7. **What he would do differently.** Optional, often the best paragraph.

A useful shape — not a template to fill: the situation, the wrong turn, the
decision, the result (the Metric, verbatim), the cost, the lesson. 800 to 1,800
words is the usual range; stop when the story is told.

### Essay

Argues one position. Before writing a word, get the thesis from Daniel in one
sentence he agrees with — a position someone could disagree with. If there is
nothing to disagree with, there is no essay yet; say so and ask what he actually
thinks. Then ask for:

- **The example from his own work** that made him believe it. An essay anchored
  in something he did is his; one anchored in general wisdom is anyone's. Cite
  that work in `sources`.
- **The strongest objection**, and his answer to it. The essay addresses it
  openly instead of ignoring it.

600 to 1,500 words. One thesis per essay; a second one is a second essay.

## Writing

1. **One sentence first.** Before the outline, write what the reader takes away,
   in one sentence. If it will not come, the Article does not exist yet — go
   back to the interview.
2. **Outline, then confirm.** Show Daniel a short outline (section headings and a
   line each) and get a yes before drafting. Rewriting an outline is cheap;
   rewriting 1,500 words is not.
3. **Draft in English.** The Corpus and the site are English
   ([ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md)). If
   Daniel answers the interview in Portuguese, translate what he said —
   faithfully, the way a translator would, never adding.
4. **Voice.** Read `~/.claude/post-forge/voice-profile.md`. It was calibrated in
   Portuguese from his technical docs, so take its **posture**, not its
   vocabulary: open with the flat claim, no preamble; lead with the failure (his
   strongest trait — limitations are "the interesting part", not a footnote);
   exact numbers, never rounded to impress; dry understatement; end on the
   consequence, not a summary. First person ("I"), since it is his Article.
   **The construction "it's not X, it's Y" is banned** — he rejected it
   explicitly; state the claim on its own instead.
5. **Anti-tell pass.** Run the English section of
   `~/.claude/skills/post-forge/references/anti-tells.md` over the whole text:
   no em or en dashes (keep the pause, change the punctuation to a period or a
   colon), none of the banned words, no rule-of-three reflex, no rhetorical
   question up top, no circular ending that restates the opening.
6. **Structure for reading.** Short section headings in sentence case. Code
   blocks where code clarifies — real code he wrote or would write, never a
   plausible-looking invention presented as the actual implementation. Links
   inline. No bold for emphasis mid-sentence.
7. **Fact check against `sources`.** Before saving, reread every number and
   every claim about his work against the cited files and the interview. Any
   sentence you cannot trace, cut or ask about.

Then write the file with `status: draft`, tell Daniel where it is, and list
anything left open (a missing link, a detail he said he would confirm).

## Revising

Open the file, change what he asks, keep `date` current if the change is
substantial, and rerun steps 4 to 7 on what changed. Revising a `ready` Article
puts it back to `draft` unless Daniel says the edit is small enough to keep it
`ready`.

## Worked example

> **Daniel:** I want to write about how we got Homeet from 7 seconds to 1.5.
>
> **You:** That's `homeet-performance` in the Corpus: "Page load 7s → 1.5s;
> memory usage −30%; adopted by 5 teams". I'll write it as a case study. What
> was actually making it slow?
>
> **Daniel:** Every board loaded every card with all its comments up front.
>
> **You:** What did you try before the fix that worked?
>
> **Daniel:** Memoizing the card components. Barely moved it.
>
> **You:** Do you remember what it did move it to?
>
> **Daniel:** No, just that it wasn't worth it.
>
> **You:** Then I'll say it barely moved it, with no number. What was the fix?

The Article says memoization "barely moved it" and gives no figure, because none
was asserted; the 7s and 1.5s are quoted from the record; `sources` lists
`homeet-performance`; the file is saved as a draft.
