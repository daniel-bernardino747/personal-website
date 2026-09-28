# 04 — The career skills and their renderer move to `career`

**Status:** ready-for-agent

**Blocked by:** 02.

**What to do:** move `capture`, `article`, `generate` and `cover-letter` from `.claude/skills/` into `career/.claude/skills/`, and fix every path they name. `project:image` stays in the site, because the image is site presentation (ADR-0012). `capture` runs it by path in the site checkout, resolved from `SITE_REPO` (default `../personal-website`).

- [ ] Each skill runs end to end from a session in `career`, with no path into the site except `project:image`
- [ ] A `capture` that acquires an image writes it to the site's `public/projects/` and records the `/projects/…` path
- [ ] The site's `.claude/skills/` is empty or gone
