import { BentoAbout } from "@/components/sections/BentoAbout";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { getCorpus } from "@/lib/corpus/site";

export default function Home() {
  const corpus = getCorpus();

  return (
    <>
      <Hero />
      <BentoAbout affiliations={corpus.affiliations} />
      <Projects projects={corpus.byKind("project")} />
    </>
  );
}
