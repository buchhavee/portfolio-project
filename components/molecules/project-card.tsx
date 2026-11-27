"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Artwork } from "@/components/atoms/artwork";
import { metaLine, type Project } from "@/data/projects";
import { startCover } from "@/lib/cover";

type Props = {
  project: Project;
  span: 2 | 3 | 4;
};

// Static class names, so Tailwind finds them.
const spans = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

// Mockup sizes without JavaScript, close to Figma. The script sets the exact fit.
const mockupScale = {
  browser:
    "[--art-scale:0.48] @min-[30rem]:[--art-scale:0.65] @min-[46rem]:[--art-scale:1]",
  phone:
    "[--art-scale:0.7] [@container(height>=31rem)]:[--art-scale:1]",
};

const SIZES = "(min-width: 768px) 66vw, 100vw";

export function ProjectCard({ project, span }: Props) {
  const meta = metaLine(project);
  const card = useRef<HTMLDivElement>(null);

  return (
    <Link
      data-card-slot
      href={`/projects/${project.slug}`}
      // Only plain clicks get here: cmd, ctrl and middle clicks open a new tab as usual.
      onNavigate={(event) => {
        if (startCover({ project, source: card.current!, round: false, sizes: SIZES })) event.preventDefault();
      }}
      className={`group block rounded-xl [text-decoration:none] ${spans[span]}`}
    >
      <div
        data-card-frame
        className={`relative @container-size md:h-140 ${project.mockup === "phone" ? "h-89.5" : "h-70"}`}
      >
        <div
          ref={card}
          data-card
          data-mockup={project.mockup}
          style={{ backgroundColor: project.color }}
          className={`absolute inset-0 overflow-hidden rounded-xl ${project.mockup ? mockupScale[project.mockup] : ""}`}
        >
          <Artwork project={project} sizes={SIZES} />
          <div
            data-card-info
            className="absolute inset-x-6 bottom-6 flex translate-y-4 items-center justify-between gap-4 rounded-lg bg-bg-surface p-4 opacity-0 transition-[opacity,translate] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 in-data-flying:opacity-0! motion-reduce:transition-none max-md:hidden"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate text-h3">{project.title}</p>
              <p className="truncate text-body-sm text-text-secondary">
                {meta}
              </p>
            </div>
            <Image
              src="/images/icons/arrow-up-right.svg"
              alt=""
              width={24}
              height={24}
              className="shrink-0 dark:invert"
            />
          </div>
        </div>
      </div>
      <div data-card-caption className="pt-3 md:hidden">
        <p className="text-h3">{project.title}</p>
        <p className="pt-3 text-body-sm text-text-secondary">{meta}</p>
      </div>
    </Link>
  );
}
