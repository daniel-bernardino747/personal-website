# The site speaks to Criciúma, in Portuguese first

Until now the site has addressed remote employers and clients: it is in English, it says "Remote", and its call to action is a booking link. Daniel's goal has changed. He wants to be the developer that businesses in Criciúma and the surrounding region think of first. Those visitors search in Portuguese, search with the city's name, and decide on trust and proximity rather than on a résumé.

So the site changes audience and language together.

**Audience.** The primary visitor is a local business that needs a website, a system or an automation. The home page leads with what Daniel does for such a business and how to reach him. The portfolio, the timeline, `/achievements` and `/resume.pdf` stay, as proof, not as the pitch. "The best developer in Criciúma" is the goal, not the copy: the site never claims a superlative it cannot source (ADR-0003). It shows the work and lets the visitor conclude.

**Language.** Portuguese lives at the root (`/`, `/achievements`, `/chat`), and English moves under `/en` with the same paths. Each page declares its `lang`, its `og:locale` and its `hreflang` alternates. The visitor's browser language does not redirect anyone: a URL always serves one language, so search engines and shared links behave predictably. A switch in the navbar moves between the two versions of the same page.

**Where the Portuguese comes from.** [ADR-0005](./0005-english-as-the-corpus-language.md) stands: the Corpus is written in English, and Portuguese is translated at render time. The translation happens in `career`, which produces a Portuguese file that is committed and reviewed before it ships. `site:json` carries it beside the English. The site never translates anything itself, and it stays a reader (ADR-0013). The interface text, which is not Corpus, is the site's own and lives in a dictionary per language in this repository.

## Consequences

- `site:json` changes shape, so `SITE_JSON_VERSION` is bumped in both repositories together.
- A record whose English changed after its translation was reviewed is stale. `career` must notice that, and the site must never show an old Portuguese sentence as if it were current. A stale or missing field falls back to English, and `corpus:fetch` lists every such field.
- Metrics are quoted exactly (ADR-0008). In Portuguese the exact string is the reviewed translation of the Metric, never one the agent derives.
- On a Portuguese page the chat agent answers in Portuguese from the Portuguese slice.
- The English site at `/en` keeps the remote positioning, because the remote door stays open. The two versions share facts but may differ in emphasis (a Render Target differs in shape, never in facts).
- Local reach outside the site, such as a Google Business Profile or ChatGPT's Business Hub, is Daniel's to set up. The site only gives those listings something consistent to point at.
