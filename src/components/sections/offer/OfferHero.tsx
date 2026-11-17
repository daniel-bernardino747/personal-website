import { Globe, MapPin } from "lucide-react";

import { AvatarVideo } from "@/components/AvatarVideo";
import type { Offer } from "@/content/oferta";
import type { Identity } from "@/lib/corpus/schema";

import { ContactButtons } from "./parts";

/**
 * The home opens with the pitch (ADR-0015, ADR-0019): who, what for a business,
 * where, and how to reach him, with the first button above the fold on a phone.
 * The greeting line keeps the name on one line, as Daniel set it. Where he
 * meets clients in person the place gets a pin, otherwise a globe.
 */
export function OfferHero({ offer, identity }: { offer: Offer; identity: Identity }) {
  const PlaceIcon = offer.contact.inPerson ? MapPin : Globe;
  return (
    <section id="hero" className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 pb-16 pt-28 text-center md:pt-32">
      <AvatarVideo
        containerClassName="relative mb-8"
        className="h-28 w-28 rounded-full border-2 border-accent/20 object-cover md:h-36 md:w-36"
      />
      <p className="mb-5 text-lg font-semibold text-muted-foreground md:whitespace-nowrap md:text-xl">
        {offer.hero.greeting} <span className="text-accent-text">{identity.name}</span>
      </p>
      <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
        {offer.hero.title}
      </h1>
      <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">{offer.hero.lede}</p>
      <ContactButtons offer={offer} identity={identity} className="mt-9" />
      <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <PlaceIcon size={14} aria-hidden="true" />
        {offer.hero.eyebrow}
      </p>
    </section>
  );
}
