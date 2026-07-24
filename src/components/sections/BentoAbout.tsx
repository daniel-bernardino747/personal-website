"use client";

import type { Affiliation } from "@/lib/corpus/schema";
import { BentoBrand } from "./bento/BentoBrand";
import { BentoPhoto } from "./bento/BentoPhoto";
import { BentoExperiences } from "./bento/BentoExperiences";
import { BentoMindset } from "./bento/BentoMindset";
import { BentoLocation } from "./bento/BentoLocation";
import { BentoCraft } from "./bento/BentoCraft";
import { BentoSocials } from "./bento/BentoSocials";

export function BentoAbout({ affiliations }: { affiliations: Affiliation[] }) {
  return (
    <section id="about" className="py-16 px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:auto-rows-[200px] auto-rows-fr">
        <BentoBrand />
        <BentoPhoto />
        <BentoExperiences affiliations={affiliations} />
        <BentoMindset />
        <BentoLocation />
        <BentoCraft />
        <BentoSocials />
      </div>
    </section>
  );
}
