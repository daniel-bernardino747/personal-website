# Mindset — originals

Drop training photos, GIFs and short videos here, then run:

    npm run mindset

They are converted into `public/mindset/` — photos to WebP, GIFs and videos to muted
2.5s MP4 loops that play like GIFs — and the Mindset card cycles through
everything there, one slide every 2.5s, in filename order (`01-…`, `02-…`).

- Videos: only the **first 2.5s** is kept. Trim to the moment you want first.
- iPhone HEIC photos: export as JPG first; ffmpeg can't read HEIC.
- To remove a slide, delete it from `public/mindset/` (and from here).

This folder holds the heavy originals and is gitignored; only the converted
files in `public/mindset/` are committed.
