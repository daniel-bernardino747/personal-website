# personal-website

Daniel Bernardino's portfolio — Next.js 16 (App Router, React 19, TypeScript,
Tailwind v4), shipped as a static export.

The site does not hardcode career facts. It renders from a **career Corpus**: a
directory of markdown files that is also the single source for every generated
résumé, so the site and a PDF can never disagree about a date, a number, or a
job title.

## The `content/` directory

`content/` is the Corpus. **It is deliberately not in this repository** —
`.gitignore` excludes it. The code is public; the career record behind it is
not, and a real Corpus holds employer metrics that have no business in a public
git history.

That means a fresh clone will not build until you create one. Copy the committed
template and edit it:

```bash
cp -r content.example content   # PowerShell: Copy-Item content.example content -Recurse
npm install
npm run dev
```

`content.example/` is a working, schema-valid Corpus of three files. It exists to
be copied and overwritten, not to be edited in place.

### Layout

```
content/
  identity.md                  # exactly one — the site and résumé header
  affiliations/<id>.md         # where and when: an employer, client, course of study
  accomplishments/<id>.md      # one provable thing each
```

The **filename is the stable id**. An Accomplishment references its Affiliation
by that id (`affiliation: example-employer` → `affiliations/example-employer.md`),
never by display name. A dangling reference fails the build rather than rendering
a broken page.

### Writing an Accomplishment

```markdown
---
affiliation: example-employer      # optional — the id of a file in affiliations/
date: "2025-03"                    # required — always quoted, YYYY / YYYY-MM / YYYY-MM-DD
kind: project                      # required — see below
metric: "Cut median checkout time from 4.2s to 1.1s"   # optional
featured: true                     # optional, defaults false
title: "Example Checkout"          # the display name, when it is a named thing
---

The prose statement — the body of the file. One self-sufficient claim, written
to stand alone outside its Affiliation.

Built with Next.js, TypeScript, PostgreSQL. Live: https://example.com Repo: https://github.com/you/example
```

`kind` is one of `engineering`, `talk`, `open-source`, `project`, `education`,
`writing`.

**The metric gate.** An Accomplishment with no `metric` is a *draft*. Drafts are
excluded from résumés — a résumé must never imply a result it cannot back — but
the site's project gallery opts back in, because a shipped project whose numbers
aren't recovered yet is still a real project, and its card claims nothing
numeric. Record what is true; add the number when you have it.

**The closing conventions.** A project statement may end with any of:

| Marker | Rendered as |
| --- | --- |
| `Built with A, B and C.` | stack chips on the card |
| `Live: https://…` | a "Visit …" link |
| `Repo: https://…` | a "… on GitHub" link |

They are optional and order-independent, and only ever *split* text you wrote —
nothing is inferred. A statement that skips them renders as plain prose, which is
a correct card, just a quieter one. Only record a repository that is actually
public; a private URL renders as a link that 404s for every visitor.

Everything is validated on load (`src/lib/corpus/`), so a malformed file halts
the static export instead of shipping a broken page.

## Agent skills

Two skills in `.claude/skills/` write and read the Corpus. Neither invents a
number that is not in it.

- **`capture`** — a guided interview that records an Accomplishment or
  Affiliation into `content/`. Use it rather than hand-writing files; it is what
  keeps the frontmatter conventions above consistent.
- **`generate`** — turns a pasted job posting into a structured Selection and
  renders it to a tailored résumé PDF, plus LinkedIn/GitHub profile blocks and a
  Portuguese résumé. Output lands in `generated/`, which is gitignored so a
  résumé naming a target employer is never committed.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | development server on :3000 |
| `npm run build` | static export to `out/` |
| `npm test` | Vitest |
| `npm run render` | render a Selection to a résumé PDF |

**Tectonic** is required for `npm run render` and for the résumé smoke test in
`src/lib/render/resume.test.ts` (the test skips itself when Tectonic is absent).
Install with `scoop install tectonic` (or winget/cargo) — a single binary that
downloads only the LaTeX packages actually used.

## Further reading

- `CONTEXT.md` — the domain model and its vocabulary
- `docs/adr/` — architectural decisions
- `CLAUDE.md` — agent-facing project instructions
