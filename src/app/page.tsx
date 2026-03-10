import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Mindset } from "@/components/sections/Mindset";
import { Projects } from "@/components/sections/Projects";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Mindset />
      <Projects />
    </>
  );
}
