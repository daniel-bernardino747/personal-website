import { Clock, MapPin } from "lucide-react";

import type { Offer } from "@/content/oferta";
import type { Accomplishment, Identity } from "@/lib/corpus/schema";
import { displayTitle, parseStatement } from "@/lib/corpus/statement";

import { ContactButtons, SectionHeader } from "./parts";

/**
 * Daniel's first delivery, read from the Corpus. Renders nothing until the
 * record exists (`offer.firstDelivery.accomplishmentId`), so the section
 * appears by itself once it is captured in `career`.
 */
export function FirstDelivery({ offer, project }: { offer: Offer; project?: Accomplishment }) {
  if (!project) return null;
  const title = displayTitle(project) ?? project.id;
  const cover = project.images?.[0];
  const { prose, tech } = parseStatement(project.statement);

  return (
    <section id={offer.ids.firstDelivery} className="scroll-mt-28 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow={offer.firstDelivery.eyebrow} title={title} />
        <article className="grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2">
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.src} alt={cover.alt} loading="lazy" className="h-full w-full object-cover" />
          )}
          <div className="flex flex-col p-8">
            <p className="leading-relaxed text-muted-foreground">{prose}</p>
            {project.metric && <p className="mt-5 font-medium text-accent-text">{project.metric}</p>}
            <p className="mt-5 text-sm">{offer.firstDelivery.speedNote}</p>
            {tech.length > 0 && (
              <p className="mt-auto pt-6 font-mono text-xs text-muted-foreground">{tech.join(" · ")}</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

/** The closing call to action, with the company behind the contracts. */
export function OfferContact({ offer, identity }: { offer: Offer; identity: Identity }) {
  const { contact } = offer;
  const hours = identity.availability?.hours;
  return (
    <section id={offer.ids.contact} className="scroll-mt-28 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-accent/20 bg-accent/5 px-6 py-14 text-center md:px-16">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent-text">{contact.eyebrow}</p>
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">{contact.title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{contact.lede}</p>
        <ContactButtons offer={offer} identity={identity} className="mt-9 justify-center" />
        {contact.inPerson && identity.serviceArea && identity.inPerson && (
          <p className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} aria-hidden="true" />
            {contact.inPerson(identity.serviceArea)}
          </p>
        )}
        {contact.hours && hours && (
          <p className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={14} aria-hidden="true" />
            {contact.hours(hours)}
          </p>
        )}
        {identity.business && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            {contact.company(identity.business.name, identity.business.legalName, identity.business.cnpj)}
          </p>
        )}
      </div>
    </section>
  );
}
