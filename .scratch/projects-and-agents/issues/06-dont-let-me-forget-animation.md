# 06 — dont-let-me-forget's animation

**Status:** done, 15/11/2026 (approved by Daniel after seeing it locally)

**Blocked by:** 04

**What to do:** register `dont-let-me-forget` in the Agents section with its own animation, following the band built in 04.

- [x] Story: an idea enters the queue → resurfaces at 1d → 3d → 1w → 2w → 4w → reaches the Wall, where it can only be acted on or archived
- [x] Step captions and lay sentence in `pt` and `en`, approved by Daniel; no Metric today (the band omits it)
- [x] Same rules as 04: in-view loop, theme tokens, reduced-motion static frames, `aria-hidden` animation
- [x] Order in the section: after Square AI
- [ ] Checked in a browser in PT and EN, light and dark, mobile width (PT dark seen; EN measured at 375 and 1100px; light not looked at)

## Comments

Built 15/11/2026.

- `ForgetScene.tsx`: an "Agora / Now" panel where the idea turns up in the middle of a client's quote and is kept without derailing it, over a "Fila / Queue" ladder (1 dia, 3 dias, 1 sem, 2 sem, 4 sem, Muro). The idea hops rung by rung with an "adiada n×" count (the review skill names how many times a Note was put off); at the Wall only "Fazer" and "Arquivar" remain, and "Fazer" turns it into a task. 8 steps, ~13 s.
- The example idea is fictional ("ler sobre como precificar serviços").
- The chip is wider than a rung on a phone, so at the first and last rung it leans inwards (`x` -20% / -80%) instead of centring; measured at 375px: inside the panel at both ends, no horizontal scroll.
- Checked: PT dark on desktop (whole loop), EN at 375px and 1100px by measurement. Not checked: light theme, reduced-motion frames, a screen reader.

