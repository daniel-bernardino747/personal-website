# 06 — Post drafts go to `career`

**Status:** done

**Blocked by:** 01.

**What to do:** in the global `post-forge` skill (`~/.claude/skills/post-forge/SKILL.md`, step 7), change the canonical destination from `~/Code/personal-website/content/posts/` to `~/Code/career/posts/`. Rewrite the paragraph that justifies the path: the drafts are private because `career` is private, not because a public repo happens to ignore a folder.

- [x] The next post `post-forge` writes lands in `career/posts/`

## Comments

Done 2026-09-28. `post-forge` step 7 now names `~/Code/career/posts/` and says why. Its fallback changed too: it used to be `posts/` inside the current repository, which could be public, and it is now `~/Documents/posts/` with a warning, never inside a repo. The criterion is checked on the text of the skill. The first real post will confirm it.
