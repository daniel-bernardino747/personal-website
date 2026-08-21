---
name: capture
description: >-
  Capture a career Accomplishment or Affiliation into the Corpus through a
  guided interview. Use when Daniel describes something he did, shipped, built,
  led, gave (a talk), wrote, or published; when he wants to record a metric,
  correct one, mark something Featured; or when he starts or leaves an employer,
  client, or course of study. Writes schema-valid markdown to `content/` — never
  a blank file, never an invented number.
---

# Capture

Turn a conversational report of something Daniel did into a valid Corpus file.
"I shipped the caching layer" is the start of an interview, not a finished file:
the interview extracts the Metric while the work is still fresh, because the
failure mode is recall, not laziness — the number is rarely at hand the moment
you sit down to write.

Read `CONTEXT.md` for the vocabulary (Accomplishment, Affiliation, Metric,
Featured, draft) before you start. The field-level authority is
`src/lib/corpus/schema.ts` — if this document and the schema ever disagree, the
schema wins; update this skill to match.

## The one rule that overrides everything

**Never invent a fact, a number, or an outcome that Daniel did not assert.**
This is [ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md),
and it is the reason the skill exists. Concretely:

- Do not guess a metric, round a remembered figure, or offer a "plausible"
  number for Daniel to accept. Ask.
- Do not upgrade a hedge into a claim. "I think it roughly halved" is not "cut
  by 50%". Record what was said, or ask for the real figure.
- If a number cannot be produced right now, the Accomplishment is saved as an
  explicit **draft** (frontmatter with no `metric`). A draft is not a failure —
  it is the memory preserved without a fabricated claim. Never drop it, never
  embellish it into a record.

If you are ever unsure whether a detail was asserted or inferred, treat it as
inferred and ask.

## Where files live

```
content/
  identity.md                     one Identity (the resume header)
  affiliations/<id>.md            one Affiliation per file
  accomplishments/<id>.md         one Accomplishment per file
```

The filename (without `.md`) is the entity's stable **id**. Accomplishments
reference an Affiliation by that id, so the id must never change once other files
point at it, and an Accomplishment may only reference an Affiliation whose file
already exists — a dangling reference halts the build.

Choose ids as short, descriptive kebab-case slugs: `caching-layer`,
`react-summit-talk`, `acme-corp`. Before writing, list the target directory and
pick an id that does not collide with an existing file (unless you are
deliberately correcting that file).

## Capturing an Accomplishment

Gather all of the following through conversation, **then** write the file. Do not
write a half-formed file and patch it — hold the interview first.

1. **What happened, and its kind.** Restate what Daniel did in one line and
   confirm the `kind`:
   `engineering` · `talk` · `open-source` · `project` · `education` · `writing`.
   Infer it when obvious; confirm only when genuinely ambiguous.

2. **The Metric — the number that makes it provable.** Ask for it if it was not
   supplied.
   - If it is an **improvement**, ask for the **before and the after**
     separately ("p95 was 800ms before; what did it land at?"). A one-sided
     number ("now 120ms") rarely survives an interview.
   - If it is reach, volume, duration, or rank, ask for that figure (audience of
     300; 1200 stars; shipped in 6 weeks; top 1%).
   - If Daniel cannot produce a real number now, **stop pressing and mark it a
     draft** (see below). Do not offer one yourself.

3. **Attribution — how the outcome is attributable to Daniel.** Ask what he
   personally did, especially when the work was a team's. This is what lets him
   defend the claim when challenged, and it shapes the prose so the sentence
   credits him honestly ("rebuilt the read path", not "the team improved
   latency"). Record his role, not a borrowed team result.

4. **The Affiliation it belongs to.** List the existing Affiliations from
   `content/affiliations/` and ask which one, if any:
   - An existing id → set `affiliation: <id>` in frontmatter.
   - **None** (a talk, a personal project, open-source, independent writing) →
     omit the `affiliation` field entirely. "None" is a first-class answer,
     accepted without pushing for one.
   - A new employer/client/course that isn't recorded yet → run
     **Recording an Affiliation** below to create its file first, then reference
     the new id.

5. **The date.** When did it happen? Accept `YYYY-MM-DD` or `YYYY-MM`. Ask if not
   given — never stamp today's date or a guess.

6. **Featured?** Ask whether it should show on the public site (default **no**).
   A draft is never Featured.

7. **Compose the statement.** Write one self-sufficient sentence (occasionally
   two) that reads correctly *outside* its Affiliation, carries the metric, and
   credits Daniel per the attribution. Every clause must trace to something he
   asserted in the interview. This prose is the file body.

Then write `content/accomplishments/<id>.md`:

```markdown
---
affiliation: acme-corp          # omit this line entirely when there is none
date: "2024-03-15"              # quote the date so YAML keeps it a string
kind: engineering
metric: "p95 latency 800ms to 120ms"
featured: false
title: "Read-path cache"        # omit unless the thing has a real name
---

Rebuilt the read path around a cache, cutting p95 latency from 800ms to 120ms.
```

Field notes:
- `date`, `kind`, and a non-empty body are **required**. Everything else is
  optional.
- Always quote the `date` value so a full date isn't reparsed as a YAML
  timestamp.
- The body must not be empty — an Accomplishment with no statement is rejected.
- `title` is the **display name** of a named thing — "BaixarMusica", "PetriCar".
  The project gallery headlines a card with it, falling back to the Affiliation
  and then to no heading, so a `kind: project` file should almost always carry
  one. Ask Daniel for the name; never title-case the filename into a name he
  never used. Omit it for an Accomplishment that is a claim rather than a
  product.
- For a project, close the body with the stack — `Built with Next.js, Prisma,
  Zod.` — plus the public links, written as `Live: https://…` for a deployed URL
  and `Repo: https://…` for a public source repository. Record either, both, or
  neither; the site reads that convention back out to render stack chips and
  clickable links, so following it is what makes a card rich rather than plain.
  Only record a repository Daniel confirms is **public** — a private URL renders
  as a link that 404s for every visitor.

### When it can't be quantified yet — the draft

If step 2 produced no real number, write the file **without a `metric` field**.
The loader marks any Accomplishment lacking a metric as a draft, excludes it from
resume Selections, and keeps it retrievable so Daniel can strengthen it later.
Keep the body honest about what's missing:

The metric gate is a **résumé** rule, not a blanket one: a Selection must never
imply a result it cannot back. The site's project gallery opts back in with
`byKind('project', { includeDrafts: true })`, because a shipped project whose
numbers aren't recovered yet is still real, and its card claims nothing numeric
by appearing. Anything that *asserts* a result still needs the metric.

```markdown
---
affiliation: acme-corp
date: "2024-01-05"
kind: engineering
featured: false
---

Improved the deploy pipeline; before/after numbers still to be recovered.
```

Tell Daniel it was saved as a draft and what number would promote it to a record.

## Recording an Affiliation

An Affiliation is where and when — an employer, client, or course of study. It
holds no claims. Gather:

- **organisation** — the display name ("Acme Corp", "UFSC").
- **role** — what Daniel was/is there ("Senior Software Engineer", "MSc student").
- **period** — `start` (required if a period is given), `end` omitted while
  ongoing. Both accept `YYYY-MM` or `YYYY-MM-DD`. If the start month genuinely
  isn't known yet, the whole `period` may be omitted rather than guessed.
- **stack** — the technologies involved, as a list (may be empty).

Write `content/affiliations/<id>.md`:

```markdown
---
organisation: Acme Corp
role: Senior Software Engineer
period:
  start: "2022-01"
stack: [TypeScript, Next.js, PostgreSQL]
---

Product engineering team building the billing platform.
```

The body (a one-line description) is optional for an Affiliation — offer it, but
omit the body entirely if there's nothing to say.

## Closing an Affiliation

When Daniel leaves, do not edit every Accomplishment — set the end date once on
the Affiliation. Open its file, confirm `period.start` is present (a `period`
needs a `start` before it can carry an `end`; ask for the start if it's missing),
and add `end`:

```yaml
period:
  start: "2022-01"
  end: "2024-03"
```

Ask for the end date; never assume it. Leave everything else untouched.

## Correcting or re-marking

- **Fix a misremembered number** — open the Accomplishment file, update the
  `metric` and the matching figure in the body so the two never disagree, and
  confirm the new number with Daniel first. Fixing a draft's missing number
  (adding a `metric`) promotes it to a record automatically.
- **Feature / unfeature** — flip `featured` in the target file. Featured is
  curation, not substance: it reflects what Daniel wants to lead with today.

## Verify before you're done

Every file this skill writes must load cleanly through the loader — a malformed
Corpus halts the build (spec story 34). After writing or editing, confirm it:

```bash
npm test -- content   # loads the real content/ through loadCorpus and asserts it validates
```

A green run means the frontmatter satisfied the schema and every Affiliation
reference resolved. On a `CorpusError`, read the message — it names the file and
the offending field — fix that file, and re-run. Do not report the capture as
done until it loads.

## Worked example

> **Daniel:** I shipped the caching layer at work last month.
>
> **You:** Nice. Sounds like `engineering` work at Acme Corp — right? What was
> the before-and-after this moved? A caching layer usually shows up as latency or
> load.
>
> **Daniel:** p95 dropped a lot.
>
> **You:** I don't want to guess the figure. Do you have the before and after
> p95? If you can't pull them right now I'll save this as a draft and you can add
> the numbers later.
>
> **Daniel:** 800ms down to 120ms.
>
> **You:** And what was your part — did you build it, or lead it?
>
> **Daniel:** I rebuilt the read path around the cache myself.
>
> **You:** Feature it on the site?
>
> **Daniel:** Yeah.

Result — `content/accomplishments/caching-layer.md`:

```markdown
---
affiliation: acme-corp
date: "2024-06"
kind: engineering
metric: "p95 latency 800ms to 120ms"
featured: true
---

Rebuilt the read path around a cache, cutting p95 latency from 800ms to 120ms.
```

Had Daniel been unable to recall the figures, the same file would have been
written with no `metric` line and a body noting the numbers are still to be
recovered — saved, not dropped, and never with a number he didn't give.
