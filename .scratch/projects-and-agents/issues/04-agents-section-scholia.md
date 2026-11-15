# 04 — The Agents section, with scholia's animation

**Status:** ready-for-agent

**Blocked by:** nothing (independent of 01–03).

**What to do:** add the Agents section and its first member. See "A new section: Agents" in the [spec](../spec.md).

- [ ] A registry `id → { Animation, dictionary key }` in the site (e.g. `src/lib/projects/agents.ts`) and a `splitAgents` beside `splitLabs` in `page.tsx`; registered projects leave the gallery and show only in Agents
- [ ] The section `#agents` sits between Projects and Labs in both languages; the English navbar gets an `Agents` link, the Portuguese one does not
- [ ] Eyebrow, title and lede from the spec, in the `pt` and `en` dictionaries
- [ ] An agent band: animation (~60% width desktop, full width mobile) + name + one lay sentence + the Metric quoted exactly from the Corpus (omitted when absent) + a "Detalhes técnicos" / "Technical details" button opening the shared project dialog with the full statement
- [ ] scholia's animation (React + SVG/HTML + Framer Motion): a conversation → a distilled note drops onto a shelf → days later a new question → the right note lights up and returns to the answer. Step captions in sync, from the dictionaries (e.g. "Você conversa" / "Ele guarda o que importa" / "Dias depois, ele lembra")
- [ ] Loops every ~8–12 s while in view, paused off-screen; uses theme tokens and reads well in light and dark
- [ ] `prefers-reduced-motion`: the steps render as static frames side by side, captions visible
- [ ] Accessible: the animation is `aria-hidden` and the captions/lay sentence carry the meaning as text
- [ ] The lay sentence for scholia is drafted and approved by Daniel before merging
- [ ] A test for `splitAgents` (registered ids leave the gallery, order kept)
- [ ] Checked in a browser in PT and EN, light and dark, mobile width

## Comments
