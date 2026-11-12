import { MapPin } from "lucide-react";

import { oferta } from "@/content/oferta/pt";
import type { Accomplishment, Identity } from "@/lib/corpus/schema";
import { displayTitle, parseStatement } from "@/lib/corpus/statement";

import { ContactButtons, SectionHeader } from "./parts";

/**
 * Daniel's first delivery, read from the Corpus. Renders nothing until the
 * record exists (`oferta.firstDelivery.accomplishmentId`), so the section
 * appears by itself once it is captured in `career`.
 */
export function FirstDelivery({ project }: { project?: Accomplishment }) {
  if (!project) return null;
  const title = displayTitle(project) ?? project.id;
  const { prose, tech } = parseStatement(project.statement);

  return (
    <section id="primeira-entrega" className="scroll-mt-28 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow={oferta.firstDelivery.eyebrow} title={title} />
        <article className="grid overflow-hidden rounded-3xl border border-border bg-surface md:grid-cols-2">
          {project.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image.src} alt={project.image.alt} loading="lazy" className="h-full w-full object-cover" />
          )}
          <div className="flex flex-col p-8">
            <p className="leading-relaxed text-muted-foreground">{prose}</p>
            {project.metric && <p className="mt-5 font-medium text-accent-text">{project.metric}</p>}
            <p className="mt-5 text-sm">{oferta.firstDelivery.speedNote}</p>
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
export function LocalContact({ identity }: { identity: Identity }) {
  const { contact } = oferta;
  return (
    <section id="contato" className="scroll-mt-28 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-accent/20 bg-accent/5 px-6 py-14 text-center md:px-16">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent-text">{contact.eyebrow}</p>
        <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">{contact.title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">{contact.lede}</p>
        <ContactButtons whatsapp={identity.social.whatsapp} className="mt-9 justify-center" />
        {identity.serviceArea && identity.inPerson && (
          <p className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} aria-hidden="true" />
            {contact.inPerson(identity.serviceArea)}
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
