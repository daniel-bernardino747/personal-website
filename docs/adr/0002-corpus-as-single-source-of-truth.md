# The Corpus is the single source of truth, including for the site

Career facts live in the Corpus as markdown and nowhere else. The site reads the Corpus directly at build time rather than keeping its own hand-maintained copies in `src/data/*.ts`, which are reduced to configuration (navigation, social links, theme). The alternative — letting the site keep its own data, or generating `.ts` files from the Corpus — reintroduces the duplication this project exists to eliminate, or commits generated artifacts that drift. Migration cost was near zero: at the time of this decision the data files held ~188 lines of placeholder content.

## Consequences

A loader module sits between the Corpus and the components as the only place that knows the file format, so schema changes (expected, once real Accomplishments are written) land in one file rather than across every section. The site shows a curated subset via `featured` — it renders a Selection, like any other Render Target, not the whole Corpus.
