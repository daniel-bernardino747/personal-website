# personal-website

Daniel Bernardino's portfolio — Next.js 16 (App Router, React 19, TypeScript,
Tailwind v4), running as a standalone Next server on Railway (ADR-0007).

The site does not hardcode career facts. It renders from a **career Corpus**: a
directory of markdown files that is also the single source for every generated
résumé, so the site and a PDF can never disagree about a date, a number, or a
job title.

## The Corpus

The site does not own its data. The Corpus, the career record behind every page
and every résumé, lives in the private `career` repository (ADR-0013), and this
site is one of its readers. It never parses the markdown. Before `dev`, `build`
and `test`, `npm run corpus:fetch` runs two of `career`'s contracts and writes
their output to `.corpus/`, which is gitignored:

- `site:json`: only what the site publishes. The Identity, every Affiliation,
  every project (drafts included) and the Featured records. `career` decides
  what is public, so nothing else can reach a page, the agent or the image.
- `resume:pdf`: the complete résumé served at `/resume.pdf` (ADR-0009).

`career` is found at `CORPUS_REPO`, default the sibling directory `../career`.
A build without it stops and says so. How to write the Corpus is in `career`'s
README.

## Career skills

`capture`, `generate`, `cover-letter` and `article` write the Corpus or render
from it, so they live in `career` (ADR-0013). `npm run project:image` stays
here, because a project's image is site presentation (ADR-0012); `capture`
runs it by path.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | development server on :3000 |
| `npm run corpus:fetch` | `site:json` and the complete résumé from `career`, into `.corpus/` |
| `npm run build` | fetch, standalone build, the Featured slice baked in, packed into `deploy.tar` |
| `npm run deploy` | build here and upload to Railway (ADR-0007) |
| `npm test` | Vitest |
| `npm run project:image -- <id>` | acquire a project card's image into `public/projects/` |

**Tectonic** is required for the build: `corpus:fetch` runs `career`'s
`resume:pdf`, which renders `/resume.pdf`. Install with `scoop install tectonic`
(or winget/cargo), a single binary that downloads only the LaTeX packages used.

## Further reading

- `CONTEXT.md` — the domain model and its vocabulary
- `docs/adr/` — architectural decisions
- `CLAUDE.md` — agent-facing project instructions
