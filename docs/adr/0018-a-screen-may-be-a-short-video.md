# A screen may be a short video; the cover stays a picture

[ADR-0017](./0017-a-project-carries-several-screens.md) gave a project a carousel of screens, each a WebP. Some projects are understood only in motion: a flow, a transition, a chart filling in. So a screen after the cover may be a short video (`.scratch/project-videos/`).

- **Only in the project dialog.** The gallery card keeps a picture cover. The curved band shows several cards at once and repeats a short list to fill itself; a band of clips playing together is heavy on a phone and fights for attention. So the first entry of `images` must be a `.webp`, and both loaders refuse a video there.
- **A video is a screen like any other**, in the same `images` list, with `src` ending in `.mp4`. The list keeps its name; renaming it to something like `media` would break the contract again for no reader's benefit.
- **The poster is derived, not recorded.** `/projects/<id>/<name>.mp4` has its poster at `/projects/<id>/<name>.webp`, written by `project:image` from the clip's first frame. The record gains no field, and the `alt` (what the clip shows, in words) is approved and translated under `imageAlt:<name>` like a picture's.
- **Encoded at capture, like a picture.** `project:image --screen <name> --file <clip>` runs `ffmpeg`: H.264, no audio track, `faststart`, at most 12 s, the same two screen shapes a picture accepts and nothing cropped or trimmed, at most 3 MB. A clip over budget is re-encoded once at a lower quality and refused if still over. The files are committed and ship inside the Docker image, so the size limit is part of the contract, not a nicety.
- **Plays only when looked at.** Muted, looping and inline, and only while its slide is the current one in an open dialog. Under reduced motion it does not autoplay: the poster shows with the native controls.

## Consequences

`site:json` moved to version 4 in both repositories. The shape did not change, but a version 3 reader would refuse a `.mp4` and fail the build.

`public/projects/` now grows by megabytes per clip rather than by kilobytes per picture. If it passes a few tens of megabytes, moving videos out of the repository (and out of the image) is the decision to revisit.
