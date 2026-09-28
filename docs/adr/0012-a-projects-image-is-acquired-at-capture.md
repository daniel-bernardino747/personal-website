# A project's image is acquired at capture, never fetched at build

The project gallery described the work and never showed it. Most of the projects with a live URL already publish an Open Graph image, so the obvious move is to read `og:image` from each `Live:` URL while the page is built. That was rejected. The build is deterministic and offline today, and it runs where the Corpus lives ([ADR-0007](./0007-the-site-gains-a-runtime-on-railway.md)). A build that fetches would change the public page whenever a third-party site changes its preview, and would break or silently degrade whenever one is down. It would also put on the page an image nobody looked at, which is the image counterpart of the claim nobody made ([ADR-0003](./0003-no-fabrication-with-source-traceability.md)).

So the image is recorded like any other fact: an optional `image: { src, alt }` on the Accomplishment, written only after Daniel has seen the image and approved it. `npm run project:image -- <id>` acquires it in a fixed order — the `og:image` of the `Live:` URL, then a headless-Chrome screenshot of that URL, then a file Daniel supplies with `--file`. A GitHub-generated repository card is not a fallback, because it is a template about the repository and not a picture of the project. When none of these fits, the card has no image, and the layout treats that as a first-class state. The script writes the file and prints the frontmatter, but it never edits the Corpus itself. The `capture` skill runs it and asks before recording.

## Consequences

Files live in `public/projects/<id>.webp` and are committed. Unlike `content/`, an image exists to be shown on the public site, so versioning it in a public repository exposes nothing the site does not. The schema accepts only a `/projects/…` site path, so a remote URL cannot be recorded and hotlinked.

Every image is normalised when it is acquired: WebP, exactly 1200×630, around quality 80, through `sharp`. Anything not close to 1.91:1 is refused, not cropped. A portrait phone screenshot has to be composed onto a 1200×630 canvas before it is supplied. The fixed ratio keeps the gallery grid regular, and pre-sized files let Next's image optimisation stay off.

`alt` is required and is written once, by the person approving the image, from what the image visibly shows. Many Open Graph images carry their headline and numbers as pixels, and a derived "Preview of X" would lose them.

The image is site presentation. The résumé, the LinkedIn blocks and the Letter ignore it, and `corpus:json` leaves it out, so the contract with `prospect-me` ([ADR-0011](./0011-recon-leaves-for-its-own-repository.md)) is unchanged. Adding it there would be a deliberate, versioned change.

An image can go stale when the project changes. Re-running `project:image` and approving the result again is how a stale image gets refreshed. Nothing refreshes it automatically, for the same reason nothing fetches at build.
