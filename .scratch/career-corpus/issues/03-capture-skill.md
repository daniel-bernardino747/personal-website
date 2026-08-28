# 03 — Capture skill

**What to build:** a skill that turns a conversational report of something you did into a valid Corpus file. Saying "I shipped the caching layer" starts an interview, not a blank file: it asks for the before-and-after that makes the Metric provable, asks how the outcome is attributable to you, and asks which Affiliation it belongs to (or confirms it has none, for a talk or personal project). Only once those are answered does it write a well-formed Accomplishment. It can also record a new Affiliation when you start somewhere, and close one when you leave.

The interview exists because the failure mode is recall, not laziness — the Metric is not at hand when you sit down to write, and the questions extract it while the work is fresh. The skill must never invent a number on your behalf ([ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)); an Accomplishment you genuinely cannot quantify yet is saved as an explicit draft rather than dropped or embellished. Files it writes must validate against the schema from ticket 01.

**Blocked by:** 01 — loader and schema (the skill writes files that must satisfy the schema).

**Status:** done

- [x] Describing an accomplishment conversationally produces a valid Accomplishment file with no manual frontmatter editing
- [x] The interview asks for a Metric when none is supplied, and for a before/after on an improvement
- [x] The interview asks how the outcome is attributable to the author
- [x] The interview asks which Affiliation the Accomplishment belongs to, and accepts "none"
- [x] An accomplishment that cannot be quantified is saved as an explicit draft, never with an invented number
- [x] A new Affiliation can be recorded, and an existing one closed, through the skill
- [x] Every file the skill writes loads cleanly through the loader

## Comments

Implemented in `.claude/skills/capture/SKILL.md` (commit `e9c32b1`, extended in
`113802f`). The skill holds the interview before writing anything: `kind`, the
Metric (before/after asked separately on an improvement), attribution, the
Affiliation (with "none" as a first-class answer), and the date — never stamped
from today. Non-fabrication is the skill's first section: a hedge is not upgraded
into a claim, a number is never offered for Daniel to accept, and an
Accomplishment that cannot be quantified is written as an explicit draft
(frontmatter with no `metric`) rather than dropped or embellished. Recording and
closing an Affiliation are covered by their own sections.

The last acceptance criterion — every written file loads cleanly through the
loader — is guarded by `src/lib/corpus/content.test.ts`, which runs the real
`content/` directory (not a fixture) through `loadCorpus` and asserts every
Accomplishment's Affiliation reference resolves. The skill runs it before
finishing.

Proven by use rather than by fixture: the authored Corpus now holds 4
Affiliations and 24 Accomplishments captured through this skill, 13 of them
legitimate drafts awaiting a Metric.
