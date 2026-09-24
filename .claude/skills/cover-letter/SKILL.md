---
name: cover-letter
description: >-
  Write a cover letter for a job posting from the career Corpus and render it to
  PDF through a fixed template, as the résumé's matching pair. Use when Daniel
  says a posting requires or accepts a cover letter, asks for a letter of
  motivation / carta de apresentação, or wants a letter to go with a résumé from
  `generate`. Emits a structured Letter (never LaTeX), asks Daniel for his own
  reasons instead of inventing them, and never states a fact absent from the Corpus.
---

# Cover letter

Turn a job posting into a one-page cover letter that pairs with the résumé
`generate` produced for it. Same architecture: you write a **Letter** as
structured JSON, a versioned template renders it, and **you never write LaTeX**
([ADR-0004](../../../docs/adr/0004-structured-selection-with-a-fixed-template.md)).
The Letter's field-level authority is `letterSchema` in
`src/lib/render/letter.ts` — if this document and the schema disagree, the
schema wins; update this skill to match.

## The rule that overrides everything

A letter has two kinds of content, and each has one allowed origin
([ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md),
[ADR-0010](../../../docs/adr/0010-a-cover-letter-says-only-what-daniel-said.md)):

- **What Daniel did** comes from the Corpus — an Accomplishment's metric and
  statement, compressed, never enriched. Drafts (no `metric`) stay out.
- **Why Daniel wants this job** comes from Daniel, in this session. His
  motives, interests, plans and circumstances are not in the Corpus, and you do
  not guess them. "I've always been passionate about healthcare" is a fabricated
  fact about a person, as bad as an invented metric.

What the company does and what the role asks for may be restated from the
posting.

## Steps

1. **Find the résumé.** If `generate` already made a Selection for this posting
   (`generated/selections/<name>.json`), reuse its name and draw on the same
   Accomplishments so the letter and résumé tell one story. If not, read the
   Corpus as `generate` does (`content/identity.md`, `content/accomplishments/`).

2. **Read the posting** for the two or three things the employer most needs, and
   any hard constraint (location, work authorisation, level). A constraint the
   Corpus contradicts is raised with Daniel, never smoothed over in the letter.

3. **Interview Daniel — briefly.** Ask at most three questions, in one message,
   for what only he can supply. Typically:
   - Why this company or this mission, in his words?
   - Anything the reader will wonder about that he wants addressed (a location,
     a level change, a career move)?
   - Anything else he wants said?

   Offer a skip. If he skips, the letter has no motivation paragraph — it
   connects posting to Corpus and stops. Do not fill the gap yourself.

4. **Write the Letter** to `generated/letters/<name>.json`:

   ```jsonc
   {
     "version": 1,                        // must equal LETTER_VERSION
     "language": "en",                    // "en" or "pt"
     "targetRole": "Junior Software Engineer",
     "header": { ... },                   // identical to the résumé Selection's header
     "recipient": { "organisation": "Waymark", "name": "Hiring Team" },
     "date": "23 September 2026",
     "salutation": "Dear Waymark hiring team,",
     "paragraphs": [
       { "text": "...", "sources": ["posting"] },
       { "text": "...", "sources": ["homeet-performance", "cafecajuba-app"] },
       { "text": "...", "sources": ["daniel"] }
     ],
     "closing": "Kind regards,",
     "statedByDaniel": [
       "Daniel's answer, quoted or closely paraphrased, one item per answer."
     ]
   }
   ```

   - **2 to 5 paragraphs**, about 250–350 words in total — one page.
   - Every paragraph lists its `sources`: Accomplishment ids, or the reserved
     `posting`, `identity` (`content/identity.md`) and `daniel`. A paragraph
     mixing kinds lists all of them.
   - Any paragraph citing `daniel` requires `statedByDaniel` to record what he
     said; the schema refuses the Letter otherwise. Every `daniel` claim in the
     text must be traceable to an item there.
   - Numbers appear exactly as in the Accomplishment. One or two figures carry a
     letter; the résumé holds the rest.
   - Plain, direct, first person. No "I am writing to express my interest", no
     "passionate", no "fast-paced". Open with what he brings to what they need.

5. **Render**:

   ```bash
   npm run render:letter -- generated/letters/<name>.json
   ```

   The CLI checks every source against the Corpus and fails loudly on an unknown
   one, then writes `generated/letters/<name>.pdf`. A shape error names the
   field; fix the Letter and re-run.

6. **Read the PDF** and confirm it is one page and nothing is cut.

7. **Show Daniel** the letter text with each paragraph's sources beside it. He
   reads it before it is sent.

## Portuguese

Build the Letter in English from the Corpus, then translate `text`,
`salutation`, `closing`, `date` and `header.role`, and set `"language": "pt"`.
`statedByDaniel` stays as he said it. Translation restates; it adds nothing.

## Verify before you're done

- You wrote a Letter (JSON), never a `.tex`.
- The PDF exists, is non-empty, and is one page.
- Every figure matches its Accomplishment; no motive or circumstance appears
  that is not in `statedByDaniel`.
