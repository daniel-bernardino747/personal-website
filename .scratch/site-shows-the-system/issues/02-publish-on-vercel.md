# 02 — Publish on Vercel, on teamdbsolutions.com

**What to do:** put the site in the air at `www.teamdbsolutions.com`, deployed
from the machine that holds the Corpus, per
[ADR-0006](../../../docs/adr/0006-deploy-from-the-machine-that-holds-the-corpus.md).
The domain already exists and is already served by Vercel — it is attached to
another project and has to be moved, not bought and not re-pointed in DNS.

Everything in ticket 01 optimised what a visitor sees, and there is no visitor:
the site has never been deployed, which is why the Corpus records no `Live:`.
This is the binding constraint on everything else in this directory.

**Blocked by:** nothing in the repo. Blocked on Daniel's Vercel account — the
login, the domain move, and the first deploy are his to run.

**Status:** ready-for-human

## Prepared in this repo already

- `docs/adr/0006-…` — the decision and its consequences.
- `.vercelignore` — excludes `content/` and `generated/`, so a plain
  `vercel deploy` fails loudly instead of uploading the Corpus.
- `package.json` — `npm run deploy` (production) and `npm run deploy:preview`,
  both building locally and uploading `--prebuilt`.
- `vercel.json` — `framework: null`, so the deploy publishes `out/` as static
  files. See the root-404 section below; this file is load-bearing.
- `vercel` 59.9.1 as a devDependency, so `npm run deploy` resolves it from
  `node_modules/.bin` rather than from whatever happens to be on the PATH. With
  no CI, this machine is the only deploy path (ADR-0006), which is exactly when
  the tool doing the deploying should be pinned rather than fetched.

## The domain move

`www.teamdbsolutions.com` can belong to exactly one Vercel project at a time.
Moving it takes the old project off the domain the moment it is removed — there
is no overlap window, so confirm the old project is meant to lose it.

If both projects sit in the same Vercel account or team, no DNS record changes:
the nameservers or A/CNAME already point at Vercel, and only the project
assignment moves. If the old project is in a *different* team, the domain has to
be released from that team first and may need a verification TXT record.

Add both `teamdbsolutions.com` and `www.teamdbsolutions.com`, with www as the
primary — Vercel then redirects the apex automatically, and the URL already in
circulation keeps working.

## The root 404, and why `vercel.json` exists

The first production deploy served every route except the one that matters: `/`
and `/index.html` returned 404 while `/achievements`, `/chat` and `/guestbook`
returned 200. It was not DNS, not the domain move, and not a missing upload — the
404 body was the app's own not-found page, and the build id on it matched the
local output exactly.

The cause was in `.vercel/output/config.json`. Auto-detection let `@vercel/next`
claim the build, and its `overrides` mapped `index.html` to the path `index`
(`achievements.html` correctly to `achievements`). The homepage was therefore
published at `/index` — which answered 200 — leaving `/` matching no file and
falling through to the terminal `404` route.

A `rewrites` entry in `vercel.json` does not fix it: with `output: 'export'` the
Next builder drops rewrites, and the rebuilt config was unchanged. `framework:
null` does fix it, by keeping that builder out of a deploy that never needed it —
what ships is a static export, not a Next server. The resulting config carries no
`overrides` at all and `/` resolves to `index.html` normally.

`cleanUrls: true` must not be added back: it regenerates the identical broken
`index` override. Extension-less paths work without it, through Vercel's own
static `.html` fallback.

## Acceptance criteria

- [ ] A Vercel project exists for this site, **not** connected to the Git repo
- [ ] `npm run deploy` produces a production deployment from a local build
- [ ] The deployed site renders the real Corpus — Identity, the bento, and the
      project gallery with the wide Personal Website card from ticket 01
- [x] `www.teamdbsolutions.com` serves this project over HTTPS with a valid
      certificate
- [ ] The apex `teamdbsolutions.com` redirects to www
- [ ] No `content/` or `generated/` file is present in any deployment
- [ ] The Featured set on `/achievements` was reviewed against what should be
      public under a company domain before the first production deploy
- [ ] `content/accomplishments/personal-website.md` gains
      `Live: https://www.teamdbsolutions.com` once the domain resolves

## Notes

The last criterion closes the loop from ticket 01, where the `Live:` marker was
left out because nothing was deployed. It is a one-line edit to the closing
sentence of the statement, not a re-interview.

`/api/guestbook` is excluded by `output: 'export'` and is absent from `out/`.
The guestbook page will ship inert. That is the existing behaviour, unchanged by
this ticket, and its options are documented in the route's own TODO.
