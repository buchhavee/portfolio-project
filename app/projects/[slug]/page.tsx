import { notFound } from "next/navigation";
import { ProjectCover } from "@/components/molecules/project-cover";
import { CaseDetails } from "@/components/organisms/case-details";
import { CaseScope } from "@/components/organisms/case-scope";
import { projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export default async function Page(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound(); // an unknown slug (dynamicParams does not work with cacheComponents)

  return (
    <main>
      <ProjectCover project={project} />
      <CaseDetails project={project} />
      {project.did && <CaseScope items={project.did} />}
    </main>
  );
}
