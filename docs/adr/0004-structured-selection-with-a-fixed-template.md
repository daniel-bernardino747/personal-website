# The model emits a Selection, never a document

Resumes are typeset with LaTeX, so the obvious path is to have the model write `.tex` directly — it would let each output adapt its own layout. We do the opposite: the model emits a Selection as structured data (chosen Accomplishments, their order, their compressed text, each carrying a reference to its source file), and a versioned template under our control renders it. Standardisation then comes from the template rather than from the model's compliance with instructions, which varies between sessions; an output that departs from the format simply does not compile.

## Consequences

Layout is never tailored per application — the template is edited deliberately, by hand, and applies to every resume until changed. The Selection doubles as the audit surface for [ADR-0003](./0003-no-fabrication-with-source-traceability.md): checking thirty lines of structured content against its cited sources is tractable in a way that reviewing generated LaTeX is not.
