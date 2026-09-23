# The complete résumé is the one exception to the Featured gate

[ADR-0006](./0006-deploy-from-the-machine-that-holds-the-corpus.md) and [ADR-0008](./0008-the-agent-is-a-render-target.md) made `featured` the line between public and private: the site renders the Featured records, the agent is given only those, and the other Accomplishments — with their employer and client Metrics — never leave this machine. The site now offers a résumé to download, and Daniel decided that this one document carries everything the Corpus holds: every Accomplishment, Featured or not, records and drafts alike. A résumé that a recruiter or client asks for is the place where the whole history is expected, and a second curated subset would only be a longer `/achievements`.

The exception is scoped to that one Render Target, `/resume.pdf`. The agent, `/achievements` and every other page keep the Featured gate unchanged; widening them remains unavailable for the reasons ADR-0008 gives.

It is also the one Selection no model writes. [ADR-0004](./0004-structured-selection-with-a-fixed-template.md) has a model build each tailored Selection because tailoring needs judgement; a complete résumé needs none, so `src/lib/resume/complete.ts` assembles it mechanically and every bullet is the record's own prose, verbatim, still citing its source file. [ADR-0003](./0003-no-fabrication-with-source-traceability.md) holds by construction. A draft is printed as its prose alone — it has no Metric to show, and none is supplied.

## Consequences

The non-Featured records now reach the public, as rendered text inside a PDF. `featured` no longer answers "is this public?" on its own; it answers "is this on the site's pages and in the agent?". Capturing an Accomplishment publishes it on the next deploy, through the résumé, whether or not it is Featured — a record Daniel wants kept private has no place in `content/` at all.

The PDF is prerendered at build, like the share image, so the deployed server holds its bytes but neither Tectonic nor the non-Featured records as data: `bake-corpus` still copies only the Featured slice, and the agent's scope is unchanged. Tectonic becomes a prerequisite of the build, not only of `npm run render`; a build without it fails at `/resume.pdf` rather than shipping a broken link.
