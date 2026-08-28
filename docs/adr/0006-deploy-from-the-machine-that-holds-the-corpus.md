# The site deploys from the machine that holds the Corpus

The site is a Render Target of a Corpus that is deliberately not in the repository ([ADR-0002](./0002-corpus-as-single-source-of-truth.md)): `content/` is gitignored because the repo is public and the career record is not. That leaves a gap no git-driven build can cross — a Vercel build triggered by a push clones a repository with no Corpus, and `getIdentity()` halts the export rather than shipping a header with no name. Three ways across were considered: mirroring the Corpus into a private repository, shipping it as a build-time environment variable (it gzips to ~10KB, well inside Vercel's 64KB limit), or building locally and uploading only the rendered output.

Local build was chosen. It is the only option where the Corpus never leaves the machine — Vercel receives rendered HTML, never the source record — and it is the only one that needs no new moving part: no private mirror to keep in sync, no prebuild script writing `content/` out of an environment variable that must be re-uploaded after every capture. Deployment is therefore `vercel build && vercel deploy --prebuilt`, from a project deliberately **not** connected to the Git repository.

## Consequences

There is no push-to-deploy. The site can only be rebuilt where the Corpus lives, which is the honest consequence of ADR-0002 rather than a limitation to route around — capture already happens on that machine. A stale site is now possible in a way it would not be with git integration: the deploy is a decision, not a side effect of a merge, so the same run must always be `vercel build` immediately followed by `vercel deploy --prebuilt`, never a deploy of an old `.vercel/output`.

Connecting the project to Git later would silently reintroduce the gap — every push would attempt a Corpus-less build. Should push-to-deploy ever become necessary, reverse this by taking the environment-variable route, not by committing `content/`.

What reaches the public is decided by `featured` and by what each page selects, not by what the Corpus holds. `/achievements` renders every Featured Accomplishment including its Metric, so employer and client figures are published there by curation. That gate is a per-item decision and must be reviewed as such before each deploy.
