# A push to master deploys, built in the private repository

[ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md) kept the build on Daniel's machine for one reason: it was the only place the Corpus existed, and the only option where the record never left the machine. [ADR-0013](./0013-the-corpus-leaves-for-its-own-repository.md) changed the premise without revisiting the rule. The Corpus now lives in `career`, a private GitHub repository, so it already leaves the machine on every push. What the rule still bought was a deploy that is a decision, at the cost of every deploy needing that one machine, Docker Desktop running and a manual push. In November 2026 the site also moved from Railway to a Coolify VPS, and an image now has to reach a registry before Coolify can run it.

So a push to `master` deploys. The build runs in GitHub Actions **in `career`**, never in this repository:

1. A push to `master` here runs `.github/workflows/deploy.yml`. It builds nothing: it sends a `repository_dispatch` (`site-push`, with the commit SHA) to `career`.
2. `career`'s `.github/workflows/deploy-site.yml` checks out both repositories, installs Tectonic, and runs the same `npm run build` as on Daniel's machine. That build fetches `site:json` and `/resume.pdf`, bakes the Featured slice, and has `pack-deploy` refuse anything more (ADR-0008). It then runs the tests against that artefact, publishes the image to GHCR (`latest` plus a dated tag) and calls Coolify's deploy webhook.

The build runs in `career` because this repository is public, and so are its Actions logs. The build reads the whole Corpus, and its output names records the site never publishes (for example, the translation keys `corpus:fetch` lists). In the private repository those logs stay private, and nothing private is written to this repository's history or logs.

## Consequences

- **Only committed Corpus deploys.** An edit that exists only on Daniel's disk, a reviewed translation included, does not reach the site until it is committed and pushed in `career`.
- **The Featured review moves before the push.** ADR-0006 asked for a per-item review of what Featured publishes before each deploy. A push to `master` is now that deploy, so the review happens before it.
- **A Corpus edit alone does not deploy.** It ships with the next push here, or by running *Deploy site* by hand in `career`'s Actions. Making a push to `career` deploy too is a one-line trigger, left out on purpose: a capture is not always meant to go live.
- **A `site:json` version change still moves both repositories together.** `career` builds whatever `master` is here against its own `main`. If the two disagree on `SITE_JSON_VERSION`, the build stops at `corpus:fetch`, which is the guard working.
- **`npm run deploy` stays as the manual path** (build here, `scripts/publish-image.mjs`, redeploy in Coolify), for when Actions is unavailable.
- Secrets: in `career`, `COOLIFY_WEBHOOK`, `COOLIFY_TOKEN` (deploy permission only) and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, plus the GHCR package granting `career` write access; here, `CAREER_DISPATCH_TOKEN` (fine-grained, `career` only, Contents read and write). Runtime secrets stay in Coolify.
