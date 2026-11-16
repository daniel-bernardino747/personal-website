# A project's screens may be short videos

Status: needs-triage. Decided with Daniel, 16/11/2026.

## Problem

The project dialog shows a carousel of screens (ADR-0017), but a screen can only be a WebP picture. Some projects are best understood moving: a flow, a transition, a chart filling in. Daniel wants short videos instead of only photos.

## Decisions

- **Videos appear only in the dialog's carousel, as screens.** The gallery card keeps a picture cover: a band of cards playing video at once is heavy on a phone and fights for attention.
- **A video is a screen like any other**, in the same `images` list, with `src` ending in `.mp4`. The first entry, the cover, must still be a `.webp`.
- **The poster is derived, not recorded**: `/projects/<id>/<name>.mp4` has its poster at `/projects/<id>/<name>.webp`, written by `project:image`. The Accomplishment gains no field; the `alt` describes what the clip shows and is translated under `imageAlt:<name>` as before.
- **`site:json` goes to version 4** in both repos: the shape is unchanged, but a v3 reader would refuse a `.mp4`.
- **Encoding, by `project:image --screen <name> --file <clip>`**: H.264 MP4, no audio track, `faststart`, at most 12 s; the same ratios a picture screen accepts (close to 1200×630, or a phone portrait 9:21–9:16), scaled to fit inside 1200×630 or 630×1200 without padding; at most 3 MB, re-encoded once at a lower quality if over, refused if still over. Anything longer or of another ratio is refused, never cropped or trimmed.
- **Playback**: muted, looping, inline, only while its slide is the current one and the dialog is open. Under reduced motion it does not autoplay: the poster shows with the native controls.
- **ADR-0018** extends ADR-0017.

## Tickets

| # | Ticket | Repo | Blocked by |
|---|---|---|---|
| 01 | The contract accepts `.mp4` screens (v4) and ADR-0018 | career + site | — |
| 02 | `project:image` encodes a clip and writes its poster | site | 01 |
| 03 | The carousel plays a video screen | site | 01 |

## Out of scope

- A video cover on the gallery card.
- Sound, captions tracks, or clips longer than 12 s.
- Hosting videos outside the repository; revisit if `public/projects/` grows past a few tens of MB.
