# No API integration with LinkedIn or GitHub

The original goal was to sync career data programmatically to LinkedIn, GitHub, and this site. Research against LinkedIn's first-party docs ([notes/linkedin-api-research.md](../../notes/linkedin-api-research.md)) established that profile writes are unobtainable — the Profile Edit API is gated behind `w_compliance`, which LinkedIn lists as "Access is closed and may not be requested", with no partner tier to apply to. Feed posting via `w_member_social` is available self-serve, and GitHub profile updates work via `PATCH /user`, but both serve goals we explicitly deprioritised. We build no API client at all: LinkedIn and GitHub become paste-ready Render Targets, which delivers most of the value with none of the OAuth, credential management, or published-state tracking.

## Consequences

Keeping LinkedIn current stays a manual step — the system makes it fast, not automatic. Revisit only if publishing to the LinkedIn feed becomes a goal in its own right; profile sync should not be revisited, as it is blocked by LinkedIn, not by us.
