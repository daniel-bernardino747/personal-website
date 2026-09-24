# Recon leaves for its own repository, and reads the Corpus through `corpus:json`

The `recon` skill grew past what a portfolio repository should hold. It now ends in a built artifact for the target company rather than an email about a broken link, which needs a second deployed application, executable re-checks and structured dossiers of third-party contact details. That moved to its own repository, `prospect-me`, whose ADR-0001 records the pipeline. Prospecting output never belonged beside a portfolio.

What `prospect-me` still needs from here is the Corpus, to match a company's problem to an Accomplishment and quote its Metric exactly. Three ways to provide it were considered. Copying `content/` or mounting it as a submodule reintroduces the second copy [ADR-0002](./0002-corpus-as-single-source-of-truth.md) exists to prevent, and drifts on the first `capture`. Extracting the Corpus into its own repository, consumed by both, is the cleanest end state and a refactor this project does not need yet.

So the Corpus stays here and gains a read contract: `npm run corpus:json` prints the Corpus as validated by the loader in `src/lib/corpus/`, and `prospect-me` points at this checkout by path and consumes that output. It never parses the markdown itself, so the schema still lives in one file.

## Consequences

The two repositories are coupled by a filesystem path, which is acceptable because both only ever run on the machine that holds the Corpus ([ADR-0007](./0007-the-site-gains-a-runtime-on-railway.md)). The shape of `corpus:json` becomes an interface: a change to the loader's output is a change to a consumer outside this repository. If the Corpus is ever extracted, the contract is already the seam.

`corpus:json` emits every Accomplishment carrying a Metric, not only Featured ones — drafts stay out, because nothing that reads it may imply an unmeasured result. Its consumer runs only on this machine, and the Featured gate of [ADR-0008](./0008-the-agent-is-a-render-target.md) governs what reaches the public, not what Daniel's own tools read. It must never be run by a build or a deploy.

The `recon` skill and its output under `generated/recon/` are removed from this repository, and `CLAUDE.md` points to `prospect-me` instead.
