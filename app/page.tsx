import { Hero } from "@/components/organisms/hero";
import { Projects } from "@/components/organisms/projects";

export default function Home() {
  return (
    // The ring may reach past the sides of the screen.
    <main className="overflow-x-clip">
      <Hero />
      <Projects />
    </main>
  );
}
