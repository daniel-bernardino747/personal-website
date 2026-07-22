# 03 — Capture skill

**What to build:** a skill that turns a conversational report of something you did into a valid Corpus file. Saying "I shipped the caching layer" starts an interview, not a blank file: it asks for the before-and-after that makes the Metric provable, asks how the outcome is attributable to you, and asks which Affiliation it belongs to (or confirms it has none, for a talk or personal project). Only once those are answered does it write a well-formed Accomplishment. It can also record a new Affiliation when you start somewhere, and close one when you leave.

The interview exists because the failure mode is recall, not laziness — the Metric is not at hand when you sit down to write, and the questions extract it while the work is fresh. The skill must never invent a number on your behalf ([ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)); an Accomplishment you genuinely cannot quantify yet is saved as an explicit draft rather than dropped or embellished. Files it writes must validate against the schema from ticket 01.

**Blocked by:** 01 — loader and schema (the skill writes files that must satisfy the schema).

**Status:** ready-for-agent

- [ ] Describing an accomplishment conversationally produces a valid Accomplishment file with no manual frontmatter editing
- [ ] The interview asks for a Metric when none is supplied, and for a before/after on an improvement
- [ ] The interview asks how the outcome is attributable to the author
- [ ] The interview asks which Affiliation the Accomplishment belongs to, and accepts "none"
- [ ] An accomplishment that cannot be quantified is saved as an explicit draft, never with an invented number
- [ ] A new Affiliation can be recorded, and an existing one closed, through the skill
- [ ] Every file the skill writes loads cleanly through the loader
