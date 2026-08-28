# 01 — Record the agent system on the Personal Website Accomplishment

**What to do:** re-capture `content/accomplishments/personal-website.md` so the
Corpus records what this project actually is. No code changes — this ticket is a
`/capture` interview and the file it rewrites.

Today the entry is a card like any other: no Metric, `featured: false`, and the
whole system named in a subordinate clause — *"…with agent skills to capture new
entries and generate tailored resume PDFs"*. `recon` is not mentioned at all.
The result is that the one artefact nobody else has — three authored skills, five
ADRs, a typed schema with tests, and a LaTeX render path behind a no-fabrication
invariant — reads on the site as the faintest card in the gallery, sitting beside
bootcamp CRUDs.

The evidence is already public: `.claude/skills/capture/` and
`.claude/skills/generate/` are committed to a public repo. The Corpus simply
doesn't point at them. This ticket closes that gap at the record level, which is
where it belongs — the site is a Render Target and must not learn facts the
Corpus doesn't hold.

**Deliberately not in scope:** creating one Accomplishment per skill. A skill is
a component of this project, not a peer of it; three metric-less drafts would
inflate the record by splitting one thing into three, and `generate` could then
select them into a résumé. That is the failure
[ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)
exists to prevent. The three skills are named *inside* this one statement.

**Blocked by:** nothing. Blocked *on* Daniel — see Status.

**Status:** done

## The interview

Run `/capture` against the existing file. The skill's own rules apply in full:
the Metric is asked for, never offered, and never assembled from what the repo
happens to contain. Lines of markdown and file counts are repo trivia, not a
Metric — they measure the artefact, not the outcome.

Questions worth putting to Daniel, in the skill's own terms (categories only —
propose no values):

- How long did producing a tailored résumé take before this existed, and how long
  does it take now?
- How many résumés / LinkedIn blocks / GitHub blocks have actually been rendered
  from the Corpus so far?
- How many applications or approaches have gone out off the back of it?
- How large is the Corpus the system now drives?

If none of these can be answered honestly today, the file stays a draft with no
`metric` — correct, and better than a number that cannot be defended. `featured`
and the rewritten statement are still worth doing on their own.

## Constraints on the rewrite

- `src/lib/corpus/schema.ts` is the field-level authority; the file must load
  through `loadCorpus` (guarded by `src/lib/corpus/content.test.ts`).
- English, per [ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md).
- The statement is shared with every Render Target. It must read as a claim on a
  résumé, so nothing that is true of the page only — "you are looking at it" —
  goes in it. That fact already lives in the card, keyed by `THIS_SITE_ID` in
  `src/components/sections/Projects.tsx`.
- `parseStatement` reads exactly one `Live:` and one `Repo:` marker, first
  occurrence each, and takes only the next whitespace-delimited token. The repo
  URL is already recorded and already renders. Deep links to the individual
  `SKILL.md` files cannot be expressed here — they belong to the `#skills`
  section (ticket 02), not to this statement.
- Keep the closing `Built with …` sentence: it is what fills the card's tech
  chips. Tectonic and the LaTeX path should stay named there.
- `featured` is curation, not classification (`CONTEXT.md`) — it says this is
  worth showing today, and is expected to change.

## Acceptance criteria

- [x] `content/accomplishments/personal-website.md` names all three skills —
      capture, generate, recon — and the Corpus they read from
- [x] The statement names the render path (Selection → Tectonic → PDF) and the
      non-fabrication invariant that makes it worth anything
- [x] The statement carries a Metric Daniel asserted, or is left an explicit
      draft with no `metric` field — never an invented or repo-derived number
- [x] `featured: true`
- [x] The statement reads as a self-sufficient claim outside this page, usable
      verbatim in a résumé
- [x] The trailing `Built with …` sentence survives, and the `Repo:` link still
      parses
- [x] `npx vitest run src/lib/corpus` passes
- [x] On the rendered site the card occupies the wide `sm:col-span-2` slot, shows
      the Featured badge, and still shows "You're looking at it"

## Notes

`content/` is gitignored, so this ticket produces no commit in the repo — only
this file and the deploy change. Ticket 02 in this directory is the `#skills`
section that reads `.claude/skills/*/SKILL.md` at build time, and it depends on
nothing here.

## Comments

Captured 2026-08-28 through `/capture`, run against the existing file rather than
a new id, so nothing that pointed at `personal-website` moved.

The Metric came out of the interview as a before/after, which is the shape the
skill pushes for: **~2 hours to 3 minutes** for a résumé tailored to a posting —
about two hours of research and writing by hand against three minutes through
Selection → Tectonic. Daniel's hedge on the "before" was preserved rather than
sharpened: the body says *about two hours*, and the `metric` field carries the
`~`. The other three candidate metrics were not pursued once this one landed;
volume and approaches-sent remain available if the claim ever needs a second leg.

The rewritten statement names all three skills, the Corpus they read, the render
path, and the two invariants that make the thing worth anything — the model never
writes LaTeX, and a malformed Selection fails to render instead of quietly
producing a different document. It stays self-sufficient outside this page: the
"You're looking at it" fact was left in the card, keyed by `THIS_SITE_ID`, where
it cannot leak into a résumé bullet.

**Decision — no `Live:` marker.** The site is not published yet. The statement
records the `Repo:` only; nothing was invented to fill the slot. When it deploys,
adding one `Live: <url>` to the closing line is the whole change. Not a
re-interview.

Verified: `npx vitest run src/lib/corpus` — 43 passed, 4 files, including
`content.test.ts` which loads the real `content/` through `loadCorpus`.
`npm run build` exports cleanly, and in `out/index.html` the card renders wide
(`sm:col-span-2`), carries the Featured badge, the metric pill, the seven tech
chips (Tectonic (LaTeX) among them), the GitHub link, and "You're looking at it".

Ticket 02 — the `#skills` section reading `.claude/skills/*/SKILL.md` at build
time — is untouched by this and still open. It also inherits the live problem
this ticket did not fix: `Navbar.tsx:16` still promises `/#skills`, and `/#other`,
against sections that do not exist.
