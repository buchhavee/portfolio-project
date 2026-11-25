import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { restingLabelScale } from "@/lib/orbit";

type Props = {
  project: Project;
  repeat: boolean;
};

export function ProjectCircle({ project, repeat }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      prefetch={false} // the case pages do not exist yet
      tabIndex={repeat ? -1 : undefined}
      className="group pointer-events-auto absolute size-18 -translate-1/2 rounded-full outline-none [text-decoration:none] hover:before:absolute hover:before:-inset-6 hover:before:rounded-full sm:size-25"
    >
      <span
        style={{ backgroundColor: project.color }}
        className="relative block size-full overflow-hidden rounded-full outline-offset-4 outline-accent-default transition-[scale] duration-600 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-122 group-focus-visible:scale-122 group-focus-visible:outline-2 motion-reduce:transition-none"
      >
        <Image
          src={project.image}
          alt=""
          width={140} // 100px at its largest: nearest and hovered
          height={140}
          loading="eager"
          className="size-full object-cover"
        />
      </span>
      <span
        data-orbit-label
        style={{ scale: restingLabelScale }}
        className="pointer-events-none absolute top-[calc(100%+19px)] left-1/2 origin-top -translate-x-1/2 -translate-y-1 text-body-sm whitespace-nowrap opacity-0 transition-[opacity,translate] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        {project.title}
      </span>
    </Link>
  );
}
