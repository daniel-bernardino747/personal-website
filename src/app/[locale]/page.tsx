import { Agents } from "@/components/sections/agents/Agents";
import { Labs } from "@/components/sections/labs/Labs";
import { FirstDelivery, OfferContact } from "@/components/sections/offer/FirstDeliveryAndContact";
import { OfferHero } from "@/components/sections/offer/OfferHero";
import { EloPortal, Guarantees, HowItWorks, Services } from "@/components/sections/offer/OfferSections";
import { StickyWhatsApp } from "@/components/sections/offer/StickyWhatsApp";
import { Projects } from "@/components/sections/Projects";
import { getOffer } from "@/content/oferta";
import { getCorpus, getIdentity } from "@/lib/corpus/site";
import { splitAgents } from "@/lib/projects/agents";
import { splitLabs } from "@/lib/projects/labs";
import { isLocale } from "@/i18n/routing";
import { localBusinessJsonLd, localeAlternates } from "@/lib/seo";
import type { Metadata } from "next";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates("/", isLocale(locale) ? locale : "pt") };
}

/**
 * Both languages sell software: Portuguese to businesses in Criciúma
 * (ADR-0015), English to founders and small businesses abroad (ADR-0019).
 * The offer comes first, then the work as proof, then the contact.
 */
export default async function Home({ params }: Params) {
  const { locale: param } = await params;
  const locale = isLocale(param) ? param : "pt";
  const offer = getOffer(locale);
  const corpus = getCorpus(locale);
  const identity = getIdentity(locale);
  const projects = corpus.byKind("project", { includeDrafts: true });
  // A Labs demo shows once, in the Labs section, and an agent once, in the
  // Agents section; neither also appears among the projects.
  const { labs, rest: notLabs } = splitLabs(projects);
  const { agents, rest } = splitAgents(notLabs);
  const whatsapp = offer.reach.whatsapp && identity.social.whatsapp;

  return (
    <>
      {/* Schema.org for search: a service-area business in Criciúma, no address. */}
      {locale === "pt" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd(identity, offer.seo.description)).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <OfferHero offer={offer} identity={identity} />
      {identity.services && <Services offer={offer} services={identity.services} />}
      <HowItWorks offer={offer} />
      <EloPortal offer={offer} />
      <Guarantees offer={offer} />
      <FirstDelivery offer={offer} project={projects.find((p) => p.id === offer.firstDelivery.accomplishmentId)} />
      {/* The gallery shows projects without a Metric too — that gate exists so a
          résumé never implies an unmeasured result, not to hide shipped work. */}
      <Projects projects={rest} />
      <Agents agents={agents} />
      <Labs demos={labs} locale={locale} />
      <OfferContact offer={offer} identity={identity} />
      {whatsapp && offer.reach.whatsapp && (
        <StickyWhatsApp
          whatsapp={whatsapp}
          cta={offer.reach.whatsapp.cta}
          message={offer.reach.whatsapp.message}
          contactId={offer.ids.contact}
        />
      )}
    </>
  );
}
