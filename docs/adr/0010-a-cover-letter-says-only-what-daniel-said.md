# A cover letter says only what the Corpus or Daniel said

A cover letter is rendered the way a résumé is — the model emits structured data and a fixed template typesets it ([ADR-0004](./0004-structured-selection-with-a-fixed-template.md)) — but it needs something a résumé does not: a reason for wanting this particular job. That reason is a fact about Daniel, and it is not in the Corpus. Left to itself a model fills the gap with plausible motives ("a lifelong interest in healthcare"), which is the same liability as an invented metric ([ADR-0003](./0003-no-fabrication-with-source-traceability.md)): it is asked about in the interview.

So every paragraph of a Letter cites where its claims come from — an Accomplishment id, the posting, `content/identity.md`, or `daniel` — and a paragraph citing `daniel` is refused at render time unless the Letter records what Daniel actually said in `statedByDaniel`.

## Consequences

The `cover-letter` skill asks Daniel a few questions before writing, and when he skips them the letter has no motivation paragraph rather than an invented one. The schema can prove that a `daniel` claim has recorded words behind it, not that the words support the claim; that last step stays with review, as for the résumé. The shared identity header and escaping live in `src/lib/render/document.ts`, so the letter and the résumé cannot drift into looking like different people's documents.
