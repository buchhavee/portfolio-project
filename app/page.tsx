import { AboutTeaser } from "@/components/organisms/about-teaser";
import { Hero } from "@/components/organisms/hero";
import { Projects } from "@/components/organisms/projects";

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Hero />
      <Projects />
      <AboutTeaser />
    </main>
  );
}
