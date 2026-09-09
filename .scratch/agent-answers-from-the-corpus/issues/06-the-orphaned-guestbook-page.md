# 06 — The orphaned guestbook page

**What to do:** decide what `/guestbook` is for, now that its API route is gone.

**Status:** needs-triage

**Blocked by:** nothing. Not blocking anything.

## The situation

Issue 02 deletes `src/app/api/guestbook/route.ts`. That changes nothing in
production — `output: 'export'` already excluded the route, so the form has
always POSTed into a 404 and fallen through to its `catch`, showing the error
state. Deleting the file preserves that behaviour and closes the hole the new
runtime would otherwise open: a `console.log` stub accepting arbitrary JSON on a
live public endpoint.

What is left is `src/app/guestbook/page.tsx` — a complete, styled form that
cannot succeed. It is reachable, it looks functional, and submitting it always
fails.

## Why this is its own ticket

It was already broken before any of this, so fixing it is not part of getting the
agent live, and folding it into issue 02 would widen that ticket for no reason.
But it should not stay this way indefinitely: a form that always errors is worse
than no form, and it is on a commercial domain.

## The options, roughly

- **Delete the page.** Nothing links to it from the Navbar today
  (`Navbar.tsx:13-19` lists Home, About, Projects, Skills, Other). Cheapest, and
  honest.
- **Implement it against the same Railway Postgres** issue 03 introduces. The
  infrastructure would already be there. The cost is not the code — it is
  moderation. Anonymous public text on a company domain becomes SEO spam quickly,
  and the grilling session explicitly scoped guestbook entries out of the
  database for that reason.
- **Turn it into the contact route** the degraded chat already points at, which
  is a different page wearing this one's layout.

## Note

While in `Navbar.tsx`: it promises `/#skills` and `/#other` against sections that
do not exist. That is recorded in
`.scratch/site-shows-the-system/issues/01-record-the-agent-system.md` and is not
this ticket's job, but the two would be fixed in the same sitting.
