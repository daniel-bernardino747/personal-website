import { BentoAbout } from "@/components/sections/BentoAbout";
import { Hero } from "@/components/sections/Hero";
import { Labs } from "@/components/sections/labs/Labs";
import { FirstDelivery, LocalContact } from "@/components/sections/local/FirstDeliveryAndContact";
import { LocalHero } from "@/components/sections/local/LocalHero";
import { EloPortal, Guarantees, HowItWorks, Services } from "@/components/sections/local/OfferSections";
import { StickyWhatsApp } from "@/components/sections/local/StickyWhatsApp";
import { Projects } from "@/components/sections/Projects";
import { oferta } from "@/content/oferta/pt";
import { careerTimeline } from "@/lib/corpus/career";
import { getCorpus, getIdentity } from "@/lib/corpus/site";
import { listMindsetSlides } from "@/lib/mindset";
import { splitLabs } from "@/lib/projects/labs";
import { isLocale } from "@/i18n/routing";
import { localBusinessJsonLd, localeAlternates } from "@/lib/seo";
import type { Metadata } from "next";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: localeAlternates("/", isLocale(locale) ? locale : "pt") };
}

export default async function Home({ params }: Params) {
  const { locale: param } = await params;
  const locale = isLocale(param) ? param : "pt";
  const corpus = getCorpus(locale);
  const projects = corpus.byKind("project", { includeDrafts: true });
  // A Labs demo shows once, in the Labs section, not also in the gallery.
  const { labs, rest } = splitLabs(projects);

  const proof = (
    <>
      <BentoAbout
        career={careerTimeline(corpus.affiliations, corpus.accomplishments)}
        mindset={listMindsetSlides()}
      />
      {/* The gallery shows projects without a Metric too — that gate exists so a
          résumé never implies an unmeasured result, not to hide shipped work. */}
      <Projects projects={rest} />
      <Labs demos={labs} locale={locale} />
    </>
  );

  // English stays remote-first, as before (ADR-0015).
  if (locale === "en") {
    return (
      <>
        <Hero />
        {proof}
      </>
    );
  }

  // Portuguese speaks to a business in Criciúma first: the offer, then the proof.
  const identity = getIdentity(locale);
  return (
    <>
      {/* Schema.org for search: a service-area business in Criciúma, no address. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd(identity, oferta.seo.description)).replace(/</g, "\\u003c"),
        }}
      />
      <LocalHero identity={identity} />
      {identity.services && <Services services={identity.services} />}
      <HowItWorks />
      <EloPortal />
      <Guarantees />
      <FirstDelivery project={projects.find((p) => p.id === oferta.firstDelivery.accomplishmentId)} />
      {proof}
      <LocalContact identity={identity} />
      {identity.social.whatsapp && <StickyWhatsApp whatsapp={identity.social.whatsapp} />}
    </>
  );
}
