# The site gains a runtime, on Railway

Supersedes [ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md).

The site has been a static export since it was scaffolded: `output: 'export'`, `framework: null` and a `/:path*` → `/:path*.html` rewrite in `vercel.json`, and `out/` uploaded prebuilt. Nothing on the deployed site executes. The chat at `/chat` is therefore not a chat — it answers from strings compiled into the bundle, because there was nowhere to send a question.

An agent answering from the Corpus needs a server-side secret, and an API key in a browser is a leaked API key. So `output: 'export'` comes out and the site becomes an ordinary Next application. That much was decided independently of where it runs.

Where it runs changed for a reason that has nothing to do with the agent. The Vercel account is on the `hobby` plan, whose terms prohibit commercial use, and the site is served at `teamdbsolutions.com` — a company domain, alongside a `recon` skill whose output is a commercial approach to a decision-maker. The exposure there is not technical: it is an account suspension, on the account hosting the domain used to prospect. Two ways out existed — upgrade to Vercel Pro, or move to Railway, which is already paid for and carries no such restriction. Railway was chosen; it also puts the app beside the Postgres this effort needs.

**The deploy mechanism is the load-bearing part, and it is inherited from ADR-0006 unchanged in principle.** `content/` is gitignored because the repository is public and the career record is not, so a build that clones the repo has no Corpus and `getIdentity()` halts it. Railway offers two natural paths and both fail here: a Git-connected service reproduces exactly that Corpus-less build, and `railway up` uploads the working directory — which would send all 26 Accomplishments to the builder, strictly more exposure than Vercel ever had.

So the build stays local and only the artefact travels. `next build` runs here with `output: 'standalone'`; a Dockerfile copies `.next/standalone`, `.next/static` and `public` and nothing else; `.dockerignore` excludes `content/` and `generated/` the way `.vercelignore` did. Railway receives a built image, never the source record. The one-line rule from ADR-0006 survives verbatim: **the build happens where the Corpus lives, and only the rendered artefact travels.**

## Consequences

`src/app/api/guestbook/route.ts` stops being inert. Under `output: 'export'` it was excluded from the build, so `/guestbook` has always POSTed into a 404 and shown its error state. With a runtime it would become a live public endpoint accepting arbitrary JSON. It is deleted rather than kept, which preserves the behaviour production already has. The page it served is left orphaned and recorded separately.

`vercel.json` and `.vercelignore` are removed, and with them the two workarounds that cost real debugging (`framework: null` for the root 404, and the catch-all rewrite for extension-less paths — the full diagnosis is in `.scratch/site-shows-the-system/issues/02-publish-on-vercel.md`). They existed only to make a static export behave under a builder that assumed Next. Neither has a Railway equivalent, and neither is needed.

`www.teamdbsolutions.com` moves again. That ticket documents how much the first move cost; the same caution applies, and there is again no overlap window.

There is still no push-to-deploy, for the same reason as before, and that remains the honest consequence of ADR-0002 rather than a limitation to route around. A stale site is possible; the deploy is a decision, not a side effect of a merge. Connecting the Railway service to Git would silently reintroduce the gap.

The site can now fail at runtime, which a static export could not. A build error used to be the only failure mode and it was loud and local; a container can now time out, exhaust a quota, or lose its database in front of a visitor. Every such path degrades into an honest message, never a fabricated one — see [ADR-0008](./0008-the-agent-is-a-render-target.md).

Should this need reversing, the path back is Vercel Pro with the `vercel build && vercel deploy --prebuilt` flow of ADR-0006, and the `vercel.json` keys restored from the ticket above rather than rediscovered.
