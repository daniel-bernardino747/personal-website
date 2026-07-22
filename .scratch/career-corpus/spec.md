# Career Corpus

Status: ready-for-agent

## Problem Statement

Daniel's professional record is scattered and mostly fictional. Career facts live in three incompatible places: placeholder TypeScript data files (`projects.ts` describes "Project Alpha" at `github.com/yourname`, `achievements.ts` claims a React Summit talk and a Stack Overflow top 1%), hardcoded JSX inside bento components (`BentoExperiences` names the GenAI Science Club and UFSC directly in markup), and — for everything that actually happened — nowhere at all. There is no record of employment history anywhere in the repo.

The consequence is felt at the moment of applying for a job. Building a resume means reconstructing a career from memory, and memory does not keep numbers. The latency improvement is remembered; the 800ms is not. What gets written instead is "improved performance", which persuades nobody and cannot be defended in an interview.

Applying to several roles multiplies the problem. Each posting deserves a different emphasis — the same year at the same employer is three bullets for a backend role and one for a frontend role — but re-editing a document per application is slow enough that it doesn't happen, so one generic resume goes to everyone.

Research against LinkedIn's first-party documentation ([notes/linkedin-api-research.md](../../notes/linkedin-api-research.md)) closed off the obvious escape: profile writes are gated behind a permission LinkedIn states may not be requested. Keeping LinkedIn current will remain manual regardless of what is built here.

## Solution

A Corpus in this repo becomes the single place career facts are written. Each Accomplishment is captured once, in English, with the Metric that makes it provable, at the time it is fresh. Each Affiliation — an employer, a client, a course of study — is recorded once and never rewritten.

Capture happens through an interview rather than a blank file. Saying "I shipped the caching layer" prompts questions for the before-number, the after-number, and how the improvement is attributable, and only then is a file written. This exists because the failure is not laziness but recall: the Metric is not at hand when sitting down to write, and the interview extracts it while the work is still recent.

Generation runs in an agent session in this repo. A job posting goes in; the model reads the Corpus and emits a Selection — which Accomplishments, in what order, compressed how — with every bullet carrying a reference back to its source file. A versioned LaTeX template renders the Selection to PDF. The model never writes LaTeX, so every resume shares one layout, and a Selection that departs from the expected shape fails to render rather than producing a subtly different document.

The same Corpus feeds the portfolio site, which stops carrying placeholder data and starts reading real content, and produces paste-ready blocks for LinkedIn and the GitHub profile. Nothing calls a third-party API.

## User Stories

### Capture

1. As Daniel, I want to record an Accomplishment by describing it conversationally, so that capturing does not require remembering a file format.
2. As Daniel, I want to be asked for the Metric when I have not supplied one, so that I do not record an unprovable claim.
3. As Daniel, I want to be asked for a before-and-after when I describe an improvement, so that the Accomplishment survives scrutiny in an interview.
4. As Daniel, I want to be asked how the outcome is attributable to me, so that I can defend the claim when challenged.
5. As Daniel, I want to be asked which Affiliation an Accomplishment belongs to, so that it renders under the right employer.
6. As Daniel, I want to record an Accomplishment with no Affiliation, so that talks, open-source work and personal projects have a home.
7. As Daniel, I want an Accomplishment I cannot yet quantify to be saved as an explicit draft, so that I keep the memory without polluting the Corpus with vague claims.
8. As Daniel, I want the capture interview to refuse to invent a number on my behalf, so that nothing enters the Corpus that I did not assert.
9. As Daniel, I want to record a new Affiliation when I start a job, so that later Accomplishments can attach to it.
10. As Daniel, I want to close an Affiliation when I leave, so that the period is accurate without editing every Accomplishment.
11. As Daniel, I want to correct an Accomplishment after capture, so that a number I misremembered can be fixed.
12. As Daniel, I want to mark an Accomplishment as Featured, so that it appears on the public site.
13. As Daniel, I want to unmark a Featured Accomplishment, so that the site reflects what I want to lead with today rather than five years ago.

### Generation

14. As Daniel, I want to paste a job posting and receive a resume draft, so that tailoring costs minutes instead of an evening.
15. As Daniel, I want the model to choose which Accomplishments are relevant to that posting, so that I am not the one filtering a long list every time.
16. As Daniel, I want the model to compress a chosen Accomplishment to fit the resume, so that a detailed record does not force a long document.
17. As Daniel, I want every generated bullet to cite the source file it came from, so that I can verify each claim against what I originally wrote.
18. As Daniel, I want the model to never state a fact absent from the Corpus, so that I am never surprised by my own resume in an interview.
19. As Daniel, I want a resume in Portuguese for a Brazilian posting, so that a corpus written in English does not restrict where I apply.
20. As Daniel, I want the layout to be identical across every generated resume, so that my applications look like one person's work.
21. As Daniel, I want to review the Selection before it is rendered, so that I can correct a poor choice before it becomes a PDF.
22. As Daniel, I want to edit a Selection and re-render, so that a fix does not require regenerating from scratch.
23. As Daniel, I want a Selection referencing a nonexistent Accomplishment to fail loudly, so that a stale Selection cannot silently drop content.
24. As Daniel, I want generated resumes kept out of the published site, so that a resume naming a target employer is never publicly reachable.
25. As Daniel, I want generated output kept out of version control, so that the repo records my career rather than my job search.
26. As Daniel, I want a paste-ready block for a LinkedIn profile section, so that updating LinkedIn is copying rather than composing.
27. As Daniel, I want a paste-ready GitHub profile summary, so that the same facts reach GitHub without an API client.

### The site

28. As a visitor, I want to see Daniel's real projects, so that I can judge actual work rather than placeholders.
29. As a visitor, I want to see Daniel's real employment history, so that I can understand his experience.
30. As a visitor, I want to see the Accomplishments Daniel considers most significant, so that I get the highlights without reading everything.
31. As Daniel, I want the site to read from the Corpus, so that publishing an update means writing one file rather than editing components.
32. As Daniel, I want career facts out of component markup, so that changing what the site says is not a code change.
33. As Daniel, I want the site to show only Featured Accomplishments, so that the Corpus can hold hundreds of entries without the site becoming a list.
34. As Daniel, I want the build to fail when the Corpus is malformed, so that a broken site is caught before deploy rather than after.
35. As Daniel, I want identity and contact details to live in the Corpus, so that my resume header and my site never disagree.

### Maintaining the Corpus

36. As Daniel, I want the Corpus validated against a schema, so that a typo in frontmatter surfaces immediately.
37. As Daniel, I want an Accomplishment pointing at a nonexistent Affiliation to be rejected, so that references cannot rot.
38. As Daniel, I want schema changes to hit one module rather than every component, so that the model can evolve as I learn what I actually need.
39. As Daniel, I want to see which Accomplishments still lack a Metric, so that I can go back and strengthen them.
40. As Daniel, I want to read the Corpus as plain markdown in any editor, so that my career record does not depend on this tooling continuing to exist.

## Implementation Decisions

### The Corpus

Two entities, per [CONTEXT.md](../../CONTEXT.md).

**Affiliation** holds the organisation an Accomplishment happened inside: name, role held there, period, and the technologies involved. It carries no claims. It is referenced by a stable identifier, not by display name, so renaming an employer does not orphan Accomplishments.

**Accomplishment** holds one provable thing, written to stand alone outside its Affiliation. Fields: an optional Affiliation reference; a date; a `kind` discriminating engineering work, talks, open-source contributions, projects, education and writing; the Metric; the prose statement; and a `featured` flag governing site inclusion. An Accomplishment without a Metric is valid but explicitly marked a draft, and is excluded from Selections by default (story 7).

**Identity** — legal name, contact address, location, and profile URLs — belongs to the Corpus, not to site configuration, because it is the resume header. What remains in `src/data/` afterwards is genuine configuration: navigation, theme, the scripted chat responses.

Files are markdown with YAML frontmatter, one entity per file, under `content/`. The prose body is the Accomplishment statement; the frontmatter carries everything else. This keeps story 40 true — the Corpus is readable and editable without any of this tooling.

### The loader — the primary seam

One module owns the boundary between the filesystem and everything else. It reads `content/`, validates frontmatter against the schema, resolves Affiliation references, rejects dangling ones, and exposes typed Affiliations and Accomplishments plus the queries consumers need (Featured only, by kind, by Affiliation, drafts).

No consumer parses frontmatter. Site components, the Selection generator and any future Render Target all go through this module. This is the mitigation agreed for building the site in the same phase as the Corpus: the schema is expected to change once real content exists, and that change must land in one file rather than across the component tree.

Validation failures are loud and halt the build (story 34). Because the site is a static export, a malformed Corpus becomes a build error rather than a broken page.

### Generation

Generation is an agent session in this repo governed by a skill, not application code. There is no CLI and no API client in this phase. The skill carries the resume format, the tone, the compression rules, and the non-fabrication constraint of [ADR-0003](../../docs/adr/0003-no-fabrication-with-source-traceability.md).

The model's sole output is a **Selection**: structured data naming the target role, the sections, the chosen Accomplishments in order, and the compressed text for each, where every entry retains the identifier of its source file. The model does not write LaTeX ([ADR-0004](../../docs/adr/0004-structured-selection-with-a-fixed-template.md)). Standardisation is therefore structural — a Selection that does not match the expected shape fails to render.

Selections and rendered PDFs are written to a generated directory that is gitignored and outside the static export (stories 24, 25).

### Rendering

Tectonic is the LaTeX engine: a single binary that fetches only the packages the document uses, chosen over a full TeX distribution so the repo stays clonable and reproducible. It is not currently installed on the development machine; installation is a prerequisite task, not an assumption.

The template is a minimal document written against the Selection schema directly rather than adapting an existing CV class to it. It is versioned, hand-edited, and never touched by the model.

Portuguese output is produced by translating at render time from the English Corpus ([ADR-0005](../../docs/adr/0005-english-as-the-corpus-language.md)). Translation restates existing facts and so remains inside the non-fabrication rule.

### The site

Every component currently importing from `src/data/` moves to the loader. Separately, career facts hardcoded in bento component markup — the GenAI Science Club, UFSC, the experience blurb — are extracted into the Corpus (story 32); this is not a data-source swap but content extraction, and is the larger part of the site work.

`achievements.ts` is retired with the `Achievement` vocabulary it carries; the achievements page renders Featured Accomplishments instead. Whether the `/achievements` route keeps its URL is deliberately left to implementation, as nothing depends on it.

The site is Next.js 16 with React 19, Tailwind v4 and `output: 'export'`. Corpus reads happen at build time in Server Components; the loader must not be pulled into client bundles.

### Explicitly not built

No OAuth flow, no credential storage, no published-state tracking, no HTTP client for LinkedIn or GitHub ([ADR-0001](../../docs/adr/0001-no-linkedin-github-api-integration.md)).

## Testing Decisions

A good test here fixes external behaviour and says nothing about how it is achieved. Tests point a fixture Corpus at the loader and assert on what comes out; they do not assert on how files are walked, how frontmatter is parsed, or in what order anything happens. Renaming an internal helper must not break a test.

There is no prior art — the repo has no test infrastructure, no test script, and no runner in `package.json`. Vitest is introduced for this feature.

**The loader** carries the coverage, because it is the only place in the system where a defect is silent: a schema mistake corrupts both the site and every resume without raising anything. Tests use fixture Corpus directories as input and cover: a well-formed Corpus parsing into the expected Affiliations and Accomplishments; a missing required field failing loudly rather than yielding a partial record; an Accomplishment referencing a nonexistent Affiliation being rejected; Featured filtering returning exactly the marked subset; drafts being excluded by default and retrievable on request; and an empty Corpus being handled as a legitimate state rather than a crash.

**The render pipeline** gets a single smoke check: a fixture Selection passes through the template and Tectonic, and the assertion is that a non-trivial PDF is produced. Typography is not asserted. The failure this exists to catch is drift between the Selection shape and the template's expectations — the template reading a field the generator stopped emitting.

The capture and generation skills are prose instructing a model and have no automatable seam. Their guarantee is the human review mandated by ADR-0003, not a test.

## Out of Scope

Any programmatic write to LinkedIn or GitHub, including feed posting, which research showed is achievable but serves a goal that was explicitly deprioritised.

A CLI or API client for generation. The agent session is deliberately first: the correct prompt is not knowable until a dozen resumes have been generated by hand, and building a pipeline around an unvalidated prompt is premature. This is expected to become a script later.

A web route that generates resumes, which would break the static export and expose cost to visitors.

Automatic capture from git or GitHub activity. A commit message describes a change, not an outcome, and a model drafting Accomplishments from commits would manufacture the unverifiable impact claims ADR-0003 exists to prevent. A future version may propose reminders, never prose.

Bilingual authoring. The Corpus is English; Portuguese is generated.

Making the scripted chat page real. It is currently five hardcoded responses; a Corpus-backed version is an obvious follow-on but is not this feature.

## Further Notes

**The long pole is not code.** Every decision here assumes a Corpus rich in real, quantified Accomplishments, and populating it is Daniel's work. Because the site was chosen to migrate in this same phase, the site cannot ship until real content exists — the placeholder data it currently renders will have no replacement until then. This is the schedule risk, and no technical decision shortens it.

**Non-fabrication is a rule, not a mechanism.** Source references make verification cheap; they do not make it automatic. A Selection ships only after being read.

**The schema will change.** The first ten real Accomplishments will reveal a missing field or an over-specified `kind`. The loader seam bounds the blast radius; it does not remove the churn, and implementation should expect it rather than defend against it.

**The affiliation entity is named `Affiliation`, not `Context`.** An earlier draft called it Context, which collided with the bounded-context sense of "context" that names `CONTEXT.md` itself — the same word doing two unrelated jobs in the vocabulary's own authority. It was renamed to `Affiliation` before `content/` was populated, while the cost was a glossary edit rather than a frontmatter migration. Tickets and schema should use `Affiliation` throughout; `Context` is a banned synonym.
