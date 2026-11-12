import { MapPin } from "lucide-react";

import { AvatarVideo } from "@/components/AvatarVideo";
import { oferta } from "@/content/oferta/pt";
import type { Identity } from "@/lib/corpus/schema";

import { ContactButtons } from "./parts";

/**
 * The Portuguese home opens with the local pitch (ADR-0015): who, what for a
 * business, where, and how to reach him, with the WhatsApp button above the
 * fold on a phone. The greeting line keeps the name on one line, as Daniel set it.
 */
export function LocalHero({ identity }: { identity: Identity }) {
  return (
    <section id="hero" className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 pb-16 pt-28 text-center md:pt-32">
      <AvatarVideo
        containerClassName="relative mb-8"
        className="h-28 w-28 rounded-full border-2 border-accent/20 object-cover md:h-36 md:w-36"
      />
      <p className="mb-5 text-lg font-semibold text-muted-foreground md:whitespace-nowrap md:text-xl">
        Oi, eu sou <span className="text-accent-text">{identity.name}</span>
      </p>
      <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
        {oferta.hero.title}
      </h1>
      <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">{oferta.hero.lede}</p>
      <ContactButtons whatsapp={identity.social.whatsapp} className="mt-9" />
      <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin size={14} aria-hidden="true" />
        {oferta.hero.eyebrow}
      </p>
    </section>
  );
}
