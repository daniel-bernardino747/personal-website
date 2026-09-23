import { BentoAbout } from "@/components/sections/BentoAbout";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { careerTimeline } from "@/lib/corpus/career";
import { getCorpus } from "@/lib/corpus/site";

export default function Home() {
  const corpus = getCorpus();

  return (
    <>
      <Hero />
      <BentoAbout
        career={careerTimeline(corpus.affiliations, corpus.accomplishments)}
      />
      {/* The gallery shows projects without a Metric too — that gate exists so a
          résumé never implies an unmeasured result, not to hide shipped work. */}
      <Projects projects={corpus.byKind("project", { includeDrafts: true })} />
    </>
  );
}
