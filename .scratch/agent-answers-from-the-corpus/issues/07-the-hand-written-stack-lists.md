# 07 — The hand-written stack lists on the home page

**What to do:** decide whether the technology lists on the home page should be
read off the Corpus, the way the chat's answers now are.

**Status:** needs-triage

**Blocked by:** nothing. Not blocking anything.

## How this was found

Issue 01's acceptance criteria included grepping the export for the fabricated
terms the scripted chat answers used to contain. `Prisma` still turned up in
`out/index.html` — not from the chat, which is clean, but from
`src/data/stack.ts:30`, a hand-written list of 27 technologies rendered by
`BentoCraft` on the home page.

## Why this is a lesser problem than the chat was

The chat asserted, in Daniel's first person, an interest in coffee shops and
science fiction, and a stack including Prisma and GraphQL. That was fabrication:
prose claiming things about a person, none of it in the Corpus.

A grid of technology logos is weaker than a claim. It says "these are things I
work with", carries no Metric, and is plausibly true — Daniel may well know
Prisma. It is not a lie the way the coffee-shop line was.

But it is not traceable either, and that is the point of
[ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md).
The Corpus records real stacks — `content/affiliations/codesquare.md` lists
eleven, including Drizzle ORM and PostgreSQL. `src/data/stack.ts` was never
reconciled against them, so the site currently advertises Prisma while the Corpus
records Drizzle, and nobody can tell which one reflects the work.

## Two other things in the same corner

- `src/data/tech-stack.tsx` exports `techStack`, and nothing imports it. The
  `techStack` that `Skills.tsx` renders is a *different* array declared inline at
  `Skills.tsx:5`. The `src/data/tech-stack.tsx` file looks like dead code —
  confirm and delete it.
- `Skills.tsx` renders a section that `Navbar.tsx:16` links to as `/#skills`.
  Whether that anchor actually resolves is recorded in
  `.scratch/site-shows-the-system/issues/01-record-the-agent-system.md`.

## Options

- **Derive from the Corpus**, the way `buildChatAnswers` already derives the
  chat's Skills answer: union of the Affiliation `stack` arrays and the
  `parseStatement().tech` of the Accomplishments. Fully traceable; the list gets
  shorter and more honest, and updates itself as the Corpus grows.
- **Reconcile by hand, once** — keep the curated list but make every entry
  something the Corpus supports. Cheaper, drifts again immediately.
- **Leave it.** Defensible: it is a logo wall, not a claim. It should then be a
  deliberate decision recorded here, not an oversight nobody looked at.

## Note

`src/data/` is not automatically suspect. `CONTEXT.md` distinguishes career
facts, which belong to the Corpus, from genuine site configuration, which belongs
in `src/data/`. Colours, icon maps and layout constants are correctly there. The
question is only whether a list of technologies is a fact about Daniel's career
or a piece of page furniture — and the chat's Skills answer has now answered that
one way, which is why the home page answering it the other way is worth a ticket.
