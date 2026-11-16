# 07 — Radar Tech's animation

**Status:** done, 15/11/2026 (approved by Daniel after seeing it locally)

**Blocked by:** 04

**What to do:** register `radar-tech-sul-sc` in the Agents section with its own animation, following the band built in 04.

- [x] Story: Meetup, Sympla and SATC drop messy event announcements → a funnel keeps tech events in the region, merges duplicates and normalises → one clean Telegram post comes out → a reminder the day before
- [x] Source names as text, not brand logos
- [x] Step captions and lay sentence in `pt` and `en`, approved by Daniel; no Metric today (the band omits it)
- [x] Same rules as 04: in-view loop, theme tokens, reduced-motion static frames, `aria-hidden` animation
- [x] Order in the section: last
- [ ] Checked in a browser in PT and EN, light and dark, mobile width (PT dark on desktop; PT and EN measured at 375px and PT at 1100px; light not looked at)

## Comments

Done 15/11/2026.

- `RadarScene.tsx`: "Anúncios" with four announcements tagged by source in text (Meetup, Sympla, SATC); two are struck out ("fora do tema", "fora da região"), the two of one event become a single clean card ("2 anúncios → 1"), which travels by `layoutId` into a "Canal no Telegram" post with its sign-up link, followed by the day-before reminder. 5 steps, ~12.6 s.
- The event ("Dev Criciúma #12") is fictional.
- 500px tall stacked on a phone: at 470 the channel panel overflowed by 1px once the post and the reminder were both in it.
- Checked by reading the DOM at each step rather than by screenshots, which lagged the scene by about a second and a half.

