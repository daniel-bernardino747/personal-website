# 02 — `project:image` encodes a clip and writes its poster

**Status:** done, 16/11/2026 (approved by Daniel after seeing it locally)

**Blocked by:** 01

- [x] `--screen <name> --file <clip>` with a video file (by extension: mp4, mov, webm, mkv) goes through `ffprobe`/`ffmpeg` instead of `sharp`
- [x] Refuses a clip over 12 s, or whose ratio fits neither screen shape (the same `screenFit` rule)
- [x] Writes `<name>.mp4` (H.264, no audio, `+faststart`, fitted inside 1200×630 or 630×1200, even dimensions) and `<name>.webp` (its first frame)
- [x] Over 3 MB: one re-encode at a lower quality; still over: refuse and delete what it wrote
- [x] Prints the `images` entry (`.mp4`) and the translation key
- [x] `--force` rules as for pictures; tests for the pure decisions (duration, size budget)

## Comments

Built 16/11/2026, not committed.

- Pure rules in `src/lib/projects/image.ts`, tested: `videoFit` (≤ 12 s, the `screenFit` shapes, fitted inside the box with no padding, even dimensions), `isVideoFile`, `VIDEO_MAX_BYTES` (3 MB), `VIDEO_CRF` (28, then 34).
- `addVideoScreen` in the script: `ffprobe` with the display rotation applied (a phone `.mov` rotated 90° came out 552×1200 upright), `ffmpeg` H.264 with no audio, `+faststart`, `setsar=1` (without it the browser read 554×1200), the first frame as the WebP poster through `sharp`. A video as the cover is refused before anything else.
- Checked by hand with generated clips: 8 s landscape → 1200×630, 558 KB; rotated phone → 552×1200, 294 KB; 15 s refused; 16:9 refused; incompressible noise over budget twice, refused, nothing left behind; re-run without `--force` refused.
