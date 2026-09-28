# The Corpus leaves for its own repository, and the site becomes one of its readers

[ADR-0011](./0011-recon-leaves-for-its-own-repository.md) moved `recon` out and kept the Corpus here, calling a separate Corpus repository "the cleanest end state and a refactor this project does not need yet". It is needed now, for two reasons that surfaced once `prospect-me` existed.

The first is that the Corpus has four readers and lives inside one of them. The site renders it. `generate` and `cover-letter` turn it into résumés and Letters. `article` writes long-form pieces from it. `prospect-me` reads it through `corpus:json`. Only the site is a web application, yet the Corpus sits in the site's repository, so every other reader's output settled here as well. `generated/` holds a résumé per employer, cover letters, application emails and form answers, and `content/` has become the only private folder on this machine that anything could write into. The global `post-forge` and `devlog` skills write there, and a cold email from before `prospect-me` was found in `generated/email/`. None of that is the site's.

The second is that nothing private here is versioned. `content/` and `generated/` are gitignored because the repository is public ([ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md)), so the career record, with 32 Accomplishments and every résumé ever sent, exists as one copy on one disk. A lost disk or a `git clean -fdx` takes it with no history to recover from. The `dont-let-me-forget` queue already lives in a private repository with a remote, and nothing else follows that model.

So the Corpus moves to a private repository, `career`, and the site reads it the way `prospect-me` already does: through a contract, by path, at build time, and never by parsing the markdown.

## What moves, and what stays

`career` holds everything whose subject is Daniel's career record, or whose output is private:

- the records: `accomplishments/`, `affiliations/`, `identity.md`, `articles/`;
- the schema and the loader, now in `src/lib/corpus/`, because the format belongs with the data it describes;
- the skills that write the Corpus or render private output from it: `capture`, `article`, `generate`, `cover-letter`, along with the Tectonic templates in `src/lib/render/`;
- their output, which is `generated/` today and is now versioned for the first time;
- post drafts from `post-forge`, which are Daniel's public voice about his work and fit here better than in any application's repository.

The site keeps its code, its runtime, the chat agent and everything under `public/`, project images included. It keeps no career data of its own at all: once this lands, the repository has no gitignored private folder.

Two things stay out of `career` on purpose. Prospect dossiers stay in `prospect-me`, because they hold third-party contact details and belong to another domain. A career record should not grow a list of other people's email addresses. The devlog does not move either: it has produced no entry yet, and it earns a home once it has one.

## Two contracts, with the gate at the producer

`corpus:json` stays exactly as ADR-0011 defined it: version 1, private, local, every record with a Metric, never run by a build or a deploy. `prospect-me` notices nothing.

The site cannot use `corpus:json`, because the site is public and that contract is not. Today the site decides what is public itself, by calling the loader and filtering. After the move it receives a second contract, `site:json`, which carries exactly what the site publishes and nothing else:

- the Identity;
- every Affiliation, for the career timeline;
- every Accomplishment of kind `project`, drafts included, for the gallery, with its `image`;
- the Featured Accomplishments, which are also the agent's whole scope ([ADR-0008](./0008-the-agent-is-a-render-target.md)).

The gate therefore moves from the consumer to the producer. A record that `site:json` does not emit cannot reach the site, the agent or the deployed image, whatever the site's code does with its input. That is stronger than the current arrangement, where a single filter mistake in a Server Component would publish a record.

The complete résumé is the one document built from everything ([ADR-0009](./0009-the-complete-resume-is-the-one-exception-to-featured.md)). It is rendered in `career`, where Tectonic and the full Corpus are, and the site's build copies the finished PDF. The site stops needing Tectonic, and the non-Featured records reach it only as the pages of a PDF, exactly as they do today.

Both contracts carry a `version`, and each consumer checks it as `recon/src/corpus.ts` does. A change to either shape is a change to a consumer in another repository.

## Consequences

The site's build now requires a `career` checkout. `CORPUS_REPO` points at it, and the default is the sibling directory, as in `prospect-me`. This adds no new constraint: the build already runs only on the machine that holds the Corpus ([ADR-0007](./0007-the-site-gains-a-runtime-on-railway.md)). `bake-corpus` writes the `site:json` output into the standalone artefact instead of copying markdown files, and the agent reads that output.

About twenty files in the site import from `@/lib/corpus`. They move to a parse of `site:json`, with the site owning its own types for it, just as `recon` owns its types for `corpus:json`. Keeping one parser per reader is the cost of a versioned contract over shared code. A private npm package would remove it, but it is not worth building for two readers.

`featured` stays a field on the record, as [ADR-0002](./0002-corpus-as-single-source-of-truth.md) and ADR-0008 have it. It describes the record ("this may be said in public"), and it is `career` that applies it when producing `site:json`.

Project images stay in the site's `public/projects/`, because an image exists to be shown there ([ADR-0012](./0012-a-projects-image-is-acquired-at-capture.md)). `project:image` stays in the site too. `capture` runs it from `career` by path, and the Accomplishment still records only the `/projects/…` site path.

ADR-0002 still holds, with the Corpus in a new place. ADR-0011's recon half stands, and its decision to keep the Corpus here is superseded. The `CLAUDE.md` of both repositories, the `post-forge` destination and the `corpus:json` default path in `prospect-me` all change along with this move.
