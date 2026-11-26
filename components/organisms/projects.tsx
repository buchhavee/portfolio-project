import { ProjectCard } from "@/components/molecules/project-card";
import { projects } from "@/data/projects";

// Columns of six for each card: rows of 2, 3, 2 and 2 cards.
const SPANS = [4, 2, 2, 2, 2, 3, 3, 2, 4] as const;

export function Projects() {
  return (
    <section
      id="projects"
      data-projects
      className="px-4 pt-12 pb-16 md:px-6 md:pt-16 md:pb-24"
    >
      <div className="relative mb-6 font-medium tracking-[-0.04em] text-text-display-faded max-md:text-[6rem] max-md:leading-none md:mb-4 md:h-43.25 md:overflow-clip md:text-display">
        <h2 className="md:-mt-2.5">Projects</h2>
        <div className="absolute inset-x-0 -top-2.5 h-61.5 bg-linear-to-b from-transparent to-bg-page max-md:hidden" />
      </div>
      <div className="grid gap-6 md:grid-cols-6 md:gap-4">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} span={SPANS[i]} />
        ))}
      </div>
    </section>
  );
}
