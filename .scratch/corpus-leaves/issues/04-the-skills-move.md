# 04 — The career skills and their renderer move to `career`

**Status:** done

**Blocked by:** 02.

**What to do:** move `capture`, `article`, `generate` and `cover-letter` from `.claude/skills/` into `career/.claude/skills/`, and fix every path they name. `project:image` stays in the site, because the image is site presentation (ADR-0012). `capture` runs it by path in the site checkout, resolved from `SITE_REPO` (default `../personal-website`).

- [x] Each skill runs end to end from a session in `career`, with no path into the site except `project:image`
- [x] A `capture` that acquires an image writes it to the site's `public/projects/` and records the `/projects/…` path
- [x] The site's `.claude/skills/` is empty or gone

## Comments

Done 2026-09-28.

- `capture`, `article`, `generate` and `cover-letter` are in `career/.claude/skills/`. Their paths are relative to `career` now (`corpus/`, `generated/`, `src/corpus/`, `src/render/`), and ADR links point at `../personal-website/docs/adr/`. `CONTEXT.md` was copied along because every skill reads it. Ticket 07 trims the site's copy.
- `career` gained `render` and `render:letter`. Both rendered existing Selections/Letters there with byte-identical `.tex`.
- `capture` runs `project:image` with `npm run --prefix "${SITE_REPO:-../personal-website}"`. Run from `career`, it rewrote `public/projects/pix-na-minha-cidade.webp` identically, so git showed no change. `--file` needs an absolute path, since the script runs in the site's directory. `capture` validates with `npm test -- content` in `career`.
- Removed from the site: `.claude/skills/`, `scripts/render-*.mjs`, `src/lib/render/`, and `corpusDir`/`generatedDir` from `location.ts`, which keeps only `careerRepo()`. The site still needs Tectonic, because its build runs `career`'s `resume:pdf`.
- The skill sections of this repository's `CLAUDE.md` moved into a new `career/CLAUDE.md`.
- Verified by commands, not by a full interview: the renders, `project:image` and the content test ran from `career`. The first real `/generate` or `/capture` session there is the end-to-end check.
