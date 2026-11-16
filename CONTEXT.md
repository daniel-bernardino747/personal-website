# Personal website

Daniel's portfolio: a Next.js site with a chat agent, served at www.teamdbsolutions.com. It is one **Render Target** of the career Corpus, which lives in the private `career` repository (ADR-0013). The site owns how the record is shown, never the record itself. The canonical glossary of the Corpus is `career/CONTEXT.md`; the terms below are the ones this site's code uses, as it sees them.

## Language

**Corpus**:
Daniel's career record: Affiliations, Accomplishments and the Identity. It is written and validated in `career`; this site receives only the slice `site:json` publishes, and never parses the markdown.
_Avoid_: content, data, CMS

**site:json**:
The contract through which the site reads the Corpus: the Identity, every Affiliation, every project (drafts included) and the Featured records. What it leaves out cannot reach a page, the agent or the deployed image, because `career` applies the gate before the site ever sees the data.
_Avoid_: export, feed, API

**Accomplishment**:
One provable thing, with a `kind`. On this site it becomes a project card, a row in "Other projects", an Agent project's band, an `/achievements` entry, or something the agent may say.
_Avoid_: Achievement, highlight, win

**Cover** and **Screens**:
A project's pictures, recorded in the Corpus as `images` (ADR-0017). The first is the Cover, the 1200×630 picture its gallery card shows; the rest are Screens, shown in a carousel when the project opens. A project with no Cover is listed in "Other projects" instead of the gallery.
_Avoid_: thumbnail, screenshot (for the recorded picture)

**Agent project**:
A project with no screen of its own (an AI agent uses it, or it runs unattended), shown in the Agents section with a bespoke animation instead of a picture. Being one is the site's decision, not a Corpus field: the list is `AGENT_IDS`, and an id joins only with its animation. The code calls them agents; this glossary does not, because the **agent** is the chat agent (ADR-0008).
_Avoid_: skill, bot, automation (as the name of the section's entries)

**Affiliation**:
The organisation an Accomplishment happened inside: an employer, a client, a course of study. The career timeline is built from them.
_Avoid_: Job, position, experience

**Metric**:
The number that makes an Accomplishment provable. The agent quotes it as the exact string, never rounded or re-derived (ADR-0008). An Accomplishment without one is a draft; only a project may appear on the site as a draft.

**Featured**:
Curation, not classification: an Accomplishment worth showing today. It decides what `/achievements` lists and, entirely, what the agent knows (ADR-0008).

**Render Target**:
An audience-shaped output built from the Corpus: this site, its agent, the complete résumé at `/resume.pdf`. Targets differ in format and length, never in facts.
_Avoid_: Export, sync target, destination
