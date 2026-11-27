import Link from "next/link";
import { useRef } from "react";
import { Artwork } from "@/components/atoms/artwork";
import type { Project } from "@/data/projects";
import { startCover } from "@/lib/cover";
import { restingLabelScale } from "@/lib/orbit";

type Props = {
  project: Project;
};

// A mockup shrunk to fit a circle of 64 px on phones and 100 px from sm.
const mockupScale = {
  browser: "[--art-scale:0.096] sm:[--art-scale:0.15]",
  phone: "[--art-scale:0.128] sm:[--art-scale:0.2]",
};

export function ProjectCircle({ project }: Props) {
  const disc = useRef<HTMLSpanElement>(null);

  return (
    <Link
      href={`/projects/${project.slug}`}
      // Only plain clicks get here: cmd, ctrl and middle clicks open a new tab as usual.
      onNavigate={(event) => {
        if (startCover({ project, source: disc.current!, round: true, sizes: "140px" })) event.preventDefault();
      }}
      className="group pointer-events-auto absolute size-16 -translate-1/2 rounded-full outline-none [text-decoration:none] hover:before:absolute hover:before:-inset-6 hover:before:rounded-full sm:size-25"
    >
      <span
        ref={disc}
        style={{ backgroundColor: project.color }}
        className={`relative block size-full overflow-hidden rounded-full outline-offset-4 outline-accent-default transition-[scale] duration-600 ease-[cubic-bezier(.22,1,.36,1)] [container-type:size] group-hover:scale-122 group-focus-visible:scale-122 group-focus-visible:outline-2 motion-reduce:transition-none ${project.mockup ? mockupScale[project.mockup] : ""}`}
      >
        <Artwork project={project} sizes="140px" />
      </span>
      <span
        data-orbit-label
        style={{ scale: restingLabelScale }}
        className="pointer-events-none absolute top-[calc(100%+19px)] left-1/2 origin-top -translate-x-1/2 -translate-y-1 text-body-sm whitespace-nowrap opacity-0 transition-[opacity,translate] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 in-data-scrolled:opacity-0! motion-reduce:transition-none"
      >
        {project.title}
      </span>
    </Link>
  );
}
