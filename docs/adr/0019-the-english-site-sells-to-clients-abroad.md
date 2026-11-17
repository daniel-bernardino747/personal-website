# The English site sells to clients abroad

ADR-0015 turned the Portuguese home into an offer to businesses in Criciúma and left the English site at `/en` as it was: a portfolio for remote employers, with the hero, the bento (career timeline, mindset, craft, location) and links to `/achievements`. Daniel talked to tech recruiters, and none of them looks at a developer's personal site that way. His portfolio for employers now lives on GitHub.

So the English home sells software as well, to founders and small businesses abroad. It has the same sections as the Portuguese one (offer, how it works, Elo, guarantees, first delivery, the work as proof, contact), and the copy is written for a remote client:

- **Reach.** A call booked through the Identity's booking link, with email beside it. No WhatsApp.
- **Contract.** The templates in `contratos` are Brazilian, so the English guarantees make the same promises without naming clauses. Payment is by international transfer, not Pix. Each promise must be backed by the English contract Daniel sends.
- **Elo.** The portal's interface is in Portuguese, so the English page describes it without the phone screens.

The offer is presentation, not Corpus: one file per language in `src/content/oferta/`, sharing the `Offer` type, and the sections in `components/sections/offer/` render either one.

## Consequences

- The bento, the remote Hero and its chat input are gone. `/achievements`, `/chat` and `/resume.pdf` still exist; the navbar no longer links `/achievements`.
- The English share card and page title carry the offer, not the roles.
- If the English contract and the Portuguese one drift apart, `en.ts` follows the English contract.
