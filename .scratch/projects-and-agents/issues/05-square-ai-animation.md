# 05 — Square AI's animation

**Status:** done, 15/11/2026

**Blocked by:** 04

**What to do:** register `permit-compliance-analysis` in the Agents section with its own animation, following the band built in 04.

- [x] Story: a DWG plan and documents go in → items are checked against municipal law → a checklist of ✅ compliant / ❌ non-compliant / ➖ not applicable comes out → the engineer stamps the decision (the AI never approves or rejects; the animation must not suggest it does)
- [x] Step captions and lay sentence in `pt` and `en`, approved by Daniel; the Metric quoted exactly from the Corpus
- [x] Same rules as 04: in-view loop, theme tokens, reduced-motion static frames, `aria-hidden` animation
- [x] Order in the section: after scholia
- [ ] Checked in a browser in PT and EN, light and dark, mobile width (only PT dark was seen, by Daniel and by layout measurement at 1100 and 375px; EN and light not looked at)

## Comments

Done 15/11/2026, approved by Daniel after seeing it locally.

- `SquareScene.tsx`: a floor plan in SVG (`currentColor`, so it follows the theme) and a checklist with all four statuses the system returns (compliant, non-compliant, not applicable, inconclusive). Steps: the application arrives → a scan line passes over the plan while the items are checked → the failing balcony turns red with its depth dimensioned → a suggested opinion goes to an engineer, whose stamp is the decision. The system never approves or rejects in the scene.
- The figures are an illustration (58% coverage, a 1.80 m balcony), not a real application.
- The scene is 340px tall on desktop (540 stacked), a little taller than scholia's, so the engineer row fits under four checklist items.
- `AGENT_IDS` is now scholia, then Square AI.
- Also in this change: "Outros projetos" shows four rows and a "Ver mais (n)" / "Ver menos" toggle.
- Measuring a scene from a background tab is misleading: Chrome throttles `requestAnimationFrame`, so Framer's transforms freeze at their initial values and inflate any `getBoundingClientRect`. Layout boxes (`offsetHeight`) are the reliable check.

