# 03 — The carousel plays a video screen

**Status:** done, 16/11/2026 (approved by Daniel after seeing it locally)

**Blocked by:** 01

- [x] A `.mp4` screen renders as `<video muted loop playsInline>` with its derived poster and the `alt` as its accessible name
- [x] It plays only while it is the current slide; leaving the slide or closing the dialog pauses it
- [x] Reduced motion: no autoplay; the poster with native controls
- [x] The portrait check reads the poster, so a portrait clip makes the stage taller like a portrait picture
- [x] Checked in a browser with a generated clip (landscape and phone)

## Comments

Built 16/11/2026, not committed.

- `ScreenCarousel` renders a `.mp4` screen as `<video muted loop playsInline autoPlay preload="metadata">` with its derived poster and the alt as `aria-label`; under reduced motion `autoPlay` is off and `controls` on.
- Only the current slide is mounted, so moving on unmounts the clip (checked: the previous `<video>` leaves the DOM) and closing the dialog stops it.
- The portrait probe reads the poster, so a set with a phone clip gets the taller stage.
- Checked in Chrome with two temporary clips on ACME (landscape and phone): both play muted and looping, the right poster, the stage grows. Not checked: reduced motion, Safari/iOS.
