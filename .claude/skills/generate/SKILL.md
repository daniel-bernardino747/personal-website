---
name: generate
description: >-
  Turn a pasted job posting into a tailored résumé, or produce paste-ready
  LinkedIn and GitHub profile blocks, from the career Corpus. Use when Daniel
  pastes a posting and wants a résumé, asks to tailor a résumé to a role, wants a
  résumé in Portuguese, or wants a LinkedIn "About" / GitHub profile summary
  drawn from his real accomplishments. Emits a structured Selection (never LaTeX)
  and renders it to a gitignored PDF via Tectonic — never inventing a fact absent
  from the Corpus.
---

# Generate

Turn a job posting into a tailored résumé by reading the Corpus and emitting a
**Selection** — structured data naming the target role, the sections, and the
chosen Accomplishments in order, each carrying a reference back to its source
file. A versioned template renders the Selection to PDF. **You never write
LaTeX** ([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md));
standardisation is structural, so a Selection that departs from the expected
shape fails to render rather than producing a different-looking document.

Read `CONTEXT.md` for the vocabulary (Accomplishment, Affiliation, Metric,
Featured, draft). The Selection's field-level authority is
`src/lib/render/resume.ts` (`selectionSchema`) — if this document and the schema
ever disagree, the schema wins; update this skill to match.

The layout that module emits is derived from
[celiobjunior/resume-template](https://github.com/celiobjunior/resume-template)
(Apache-2.0): 1cm margins, ruled section headings, and a two-line context block
per group — organisation left with location flush right, role left with period
flush right. The licence notice travels in every generated `.tex`. Changing the
layout means editing `resume.ts` and bumping `SELECTION_VERSION`, never hand-
writing a `.tex`.

## The one rule that overrides everything

**Never state a fact, a number, or an outcome that is not in the Corpus.**
This is [ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md).
Concretely:

- Every résumé line comes from an Accomplishment's `metric` and statement. You
  may **compress** and **rephrase** to fit; you may never add a figure, a
  technology, or a claim the source file does not carry.
- Every entry records the `source` — the id (filename without `.md`) of the
  Accomplishment it came from. This is the audit trail: it makes reviewing the
  Selection against its sources cheap, which is the whole point.
- **Drafts are excluded.** An Accomplishment with no `metric` is a draft; it
  never enters a Selection. If a posting would be well served by a draft, say so
  and suggest capturing the number first — do not promote it yourself.
- If the Corpus is thin for a posting, produce a shorter résumé. Do not pad it.

## Where things live

```
content/                          the Corpus — READ ONLY here; never edit to fit a posting
  identity.md                     the résumé header (name, contact, links)
  affiliations/<id>.md            employers, clients, courses of study
  accomplishments/<id>.md         the provable things — the id is the `source`

generated/                        gitignored, outside the static export (stories 24, 25)
  selections/<name>.json          the Selection you write
  resumes/<name>.pdf, .tex        the rendered résumé (the CLI writes these)
  linkedin/<name>.md              paste-ready LinkedIn block
  github/<name>.md                paste-ready GitHub profile summary
```

Everything under `generated/` is gitignored and outside the published site, so a
résumé naming a target employer is never committed or reachable. Never write
generated output anywhere else.

## Producing a résumé

1. **Read the posting.** Identify the target role, the seniority, and the two or
   three capabilities it most wants evidence of.

2. **Read the Corpus.** Read `content/identity.md` for the header, and the files
   in `content/accomplishments/` for the material. Consider only records (those
   with a `metric`); ignore drafts.

3. **Select and order.** Choose the Accomplishments that speak to this posting,
   most relevant first. The same year at the same Affiliation is three bullets
   for a backend role and one for a frontend role — that judgement is the value
   here. Group them into sections (e.g. Experience, Talks, Open Source) with
   titles you choose.

4. **Compress.** Rewrite each chosen Accomplishment's statement to a tight résumé
   line that keeps the metric and the attribution. Shorter than the source, never
   richer than it.

5. **Write the Selection** to `generated/selections/<name>.json`. Use a
   descriptive name (`acme-backend`, `stripe-frontend-pt`). The shape, authored
   by `selectionSchema`:

   ```jsonc
   {
     "version": 3,                       // must equal SELECTION_VERSION in resume.ts
     "language": "en",                   // "en" or "pt"
     "targetRole": "Senior Backend Engineer",
     "header": {
       "name": "Daniel Bernardino",      // from identity.md
       "role": "Senior Backend Engineer",// optional headline — tailored to the posting
       "location": "Santa Catarina, Brazil",
       "email": "daniel@example.com",    // from identity.md social.email
       "links": [
         { "label": "github.com/daniel-bernardino747", "url": "https://github.com/daniel-bernardino747" }
       ]
     },
     "summary": "One-line positioning for this role. Optional.",
     "sections": [
       {
         "title": "Experience",
         "groups": [
           {
             // One employer, client, or project — written once, bullets beneath it.
             // The four parts are set apart: organisation left / location right,
             // then role left / period right. Only `organisation` is required.
             "heading": {
               "organisation": "Acme Corp",
               "location": "Berlin (Remote)",
               "role": "Senior Software Engineer",
               "period": "2022 - 2024"
             },
             "entries": [
               {
                 "source": "caching-layer",  // == content/accomplishments/caching-layer.md
                 "text": "Rebuilt the read path around a cache, cutting p95 latency 800ms to 120ms."
               },
               {
                 "source": "api-migration",
                 "text": "Migrated 40 endpoints to a typed API contract with zero downtime."
               },
               {
                 "source": "api-migration",
                 "label": "Techs & frameworks",  // optional bold lead-in
                 "text": "Node.js, PostgreSQL, Redis, TypeScript."
               }
             ]
           }
         ]
       },
       {
         "title": "Education",
         "groups": [
           // A heading with no entries — a context line standing on its own.
           {
             "heading": {
               "organisation": "Driven Education",
               "location": "Remote",
               "role": "Web Fullstack Development",
               "period": "2022 - 2023"
             }
           }
         ]
       }
     ]
   }
   ```

   **Group by Affiliation, always.** The Corpus stores each Accomplishment on its
   own, carrying its own `affiliation`, so three things done at one employer
   arrive as three unrelated records. Putting each in its own group renders them
   as three separate-looking jobs — a real defect on the page. Every
   Accomplishment sharing an `affiliation` belongs in one group, whose `heading`
   comes from `content/affiliations/<id>.md`: `organisation` and `role` from the
   frontmatter of the same name, `period` written from `period.start`/`period.end`
   (an ongoing Affiliation reads "2025 - Present"). Order the groups most recent
   first, and the bullets inside a group by relevance to the posting. A group with
   no `heading` is a bare list — right only for a section whose lines need no
   attribution.

   Rules the schema enforces — a Selection that breaks them **fails to render**,
   which is by design, not a bug to work around:
   - `version` must equal the template's `SELECTION_VERSION`.
   - Every entry needs a non-empty `source` and `text`; `label` is its only other
     allowed field.
   - `heading` is an **object**, never a pre-joined string — a version-2 string
     heading is refused. `organisation` is required inside it; `location`, `role`
     and `period` are optional.
   - At least one section, each with at least one group. A group needs a
     `heading`, `entries`, or both — a group with neither renders nothing and is
     refused.
   - Unknown fields are rejected. Do not invent keys the schema does not name —
     in particular there is no per-entry `detail`; context lives on the group.
   - `source` is an audit field and is **not printed** on the résumé — never put
     an id into `text`.

6. **Review before rendering** (story 21). Show Daniel the Selection — it is
   thirty lines of readable content, each with its `source`, so he can check every
   claim against what he wrote. Ship only after he has read it.

7. **Render** — this is the only step that touches LaTeX, and it is mechanical:

   ```bash
   npm run render -- generated/selections/<name>.json
   ```

   The CLI cross-checks every `source` against `content/accomplishments/` and
   fails loudly if one is missing (story 23), then writes the PDF to
   `generated/resumes/<name>.pdf`. To fix a poor choice, edit the Selection and
   re-run the same command (story 22) — no need to regenerate from scratch.

   Tectonic is required and is a prerequisite of this feature (see
   `.scratch/career-corpus/`). If it is missing, install it
   (`scoop install tectonic`, or winget/cargo) — do not attempt to render without
   it.

## A résumé in Portuguese

The Corpus is English ([ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md));
Portuguese is produced at render time by **translating the Selection**, not by
keeping a second Corpus. Build the Selection exactly as above, then:

- Translate `text`, `summary`, entry `label`s, the section `title`s, `header.role`,
  and each heading's `role`, `location` and `period` into Portuguese.
- Set `"language": "pt"` (the template switches hyphenation to Portuguese).
- Leave `source`, `version`, the heading's `organisation` (an organisation's name
  is not translated), and the header's `name`/`email`/`links` as they are.

Translation restates facts that are already in the Corpus, so it stays inside the
non-fabrication rule — a translated Selection is still reviewed before it ships.

## LinkedIn and GitHub blocks

Same Corpus, different Render Target — paste-ready text, no LaTeX, no API. Draw
only from the Corpus, prefer Featured Accomplishments, and keep every figure
traceable to a source file.

- **LinkedIn "About"** → `generated/linkedin/<name>.md`. First person, a short
  paragraph of positioning followed by three to five of the strongest metric
  lines. Written to be pasted into the profile's About section.
- **GitHub profile summary** → `generated/github/<name>.md`. Tighter than
  LinkedIn: a one-line intro and a compact list of highlights, in Markdown, for a
  `README`-style profile.

These are updated by copying, not composing — that is their whole purpose. Keep a
`source` comment or trailing note against each line if it helps Daniel verify, but
never print an id where it would look like résumé content.

## Verify before you're done

- The Selection rendered: `generated/resumes/<name>.pdf` exists and is non-empty.
- You wrote a Selection (JSON), never a `.tex` file, by hand.
- Every entry's `source` names a real `content/accomplishments/*.md` file.
- No line carries a number or claim absent from its source Accomplishment.

If the render fails on a shape error, read the message — it names the offending
field — fix the Selection, and re-run. A failed render is the standardisation
guarantee working, not a problem to route around.
