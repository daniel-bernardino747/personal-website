# Career Corpus

This repo is the single source of truth for Daniel's professional career. Career facts are written once, as versioned prose, and rendered into whatever a given audience needs — a resume tailored to a job posting, a block to paste into LinkedIn, a section of the public site.

## Language

**Accomplishment**:
Something you did that you can prove, stated with a metric and self-sufficient outside its Affiliation. The atomic unit that gets selected when building a resume. A talk, an open-source contribution, and a shipped project are all Accomplishments distinguished by kind — not separate entities.
_Avoid_: Achievement, highlight, win, bullet

**Affiliation**:
The organisation or institution an Accomplishment happened inside — an employer, a client, a course of study. Holds where and when, plus the stack involved; holds no claims of its own. Stable and rarely edited; enters every Render Target unchanged. An Accomplishment may have no Affiliation (a conference talk, a personal project).
_Avoid_: Context, job, position, employment, experience

**Corpus**:
The full body of Affiliations and Accomplishments. The single source of truth — every Render Target reads from it, nothing writes back into it except capture.

**Selection**:
The subset of the Corpus chosen for one Render Target, plus the order and compression applied to it. Produced per job posting, never hand-edited into the Corpus.
_Avoid_: Filter, query, tailoring

**Render Target**:
An audience-shaped output built from a Selection — a resume, a LinkedIn block, a page of the site. Targets differ in format and length, never in facts.
_Avoid_: Export, sync target, destination

**Metric**:
The number that makes an Accomplishment provable — a before/after, a volume, a duration, a rank. An Accomplishment without one is a draft, not a record.

**Featured**:
Curation, not classification. Marks an Accomplishment as worth showing on the public site today. Expected to change over time; carries no meaning about the Accomplishment's substance.
