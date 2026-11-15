# 04 — The Agents section, with scholia's animation

**Status:** done, 15/11/2026

**Blocked by:** nothing (independent of 01–03).

**What to do:** add the Agents section and its first member. See "A new section: Agents" in the [spec](../spec.md).

- [x] A registry `id → { Animation, dictionary key }` in the site (e.g. `src/lib/projects/agents.ts`) and a `splitAgents` beside `splitLabs` in `page.tsx`; registered projects leave the gallery and show only in Agents
- [x] The section `#agents` sits between Projects and Labs in both languages; the English navbar gets an `Agents` link, the Portuguese one does not
- [x] Eyebrow, title and lede from the spec, in the `pt` and `en` dictionaries
- [x] An agent band: animation (~60% width desktop, full width mobile) + name + one lay sentence + the Metric quoted exactly from the Corpus (omitted when absent) + a "Detalhes técnicos" / "Technical details" button opening the shared project dialog with the full statement
- [x] scholia's animation (React + SVG/HTML + Framer Motion): a conversation → a distilled note drops onto a shelf → days later a new question → the right note lights up and returns to the answer. Step captions in sync, from the dictionaries (e.g. "Você conversa" / "Ele guarda o que importa" / "Dias depois, ele lembra")
- [x] Loops every ~8–12 s while in view, paused off-screen; uses theme tokens and reads well in light and dark
- [x] `prefers-reduced-motion`: the steps render as static frames side by side, captions visible
- [x] Accessible: the animation is `aria-hidden` and the captions/lay sentence carry the meaning as text
- [x] The lay sentence for scholia is drafted and approved by Daniel before merging (approved 15/11/2026, with the captions and the scene example)
- [x] A test for `splitAgents` (registered ids leave the gallery, order kept)
- [x] Checked in a browser in PT and EN, light and dark, mobile width

## Comments

Built 15/11/2026.

- `src/lib/projects/agents.ts`: `AGENT_IDS` (order = order on the page) and `splitAgents`, tested. `page.tsx` splits Labs, then agents, then hands the rest to Projects.
- `components/sections/agents/`: `Agents.tsx` (section, bands, shared `ProjectDialog`), `StoryPlayer.tsx` (any agent's player: loops while ≥40% in view, captions as an ordered list with the current step lit; under reduced motion, one still frame per caption, with `MotionConfig reducedMotion="always"`), `ScholiaScene.tsx` (5 steps, ~12.7 s; the kept note travels from the chat to the shelf by `layoutId`, namespaced per scene with `useId`).
- `STORIES` is typed `Record<AgentId, …>`, so an id cannot join `AGENT_IDS` without an animation.
- The example inside the scene is fictional and local: choosing a print shop for a menu. One background note originally named Café Cajubá (a real client); replaced by a neutral one.
- English navbar has `Agents`; the Portuguese one does not.
- Checked in Chrome: EN and PT, dark and light, a 375px frame (stacked panels, no horizontal scroll), the full loop, "Technical details" opening the dialog, scholia gone from "Other projects". Fixed on the way: the lit note's ring was clipped by the shelf's `overflow-hidden`.
- **Not checked:** the reduced-motion frames in a browser (the extension cannot emulate the media query), and a screen reader.

