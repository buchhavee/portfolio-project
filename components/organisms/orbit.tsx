"use client";

import { type CSSProperties, useRef, useState } from "react";
import { ProjectCircle } from "@/components/molecules/project-circle";
import { projects } from "@/data/projects";
import { useOrbit } from "@/hooks/use-orbit";
import { restingTransform } from "@/lib/orbit";

const PLACES = 9; // the last one is hidden on mobile

export function Orbit() {
  const ring = useRef<HTMLUListElement>(null);
  const [bottom, setBottom] = useState(-1);
  useOrbit(ring, setBottom);

  return (
    <nav
      aria-label="Projects"
      className="orbit pointer-events-none absolute inset-0"
    >
      <ul ref={ring} data-intro className="absolute inset-0">
        {Array.from({ length: PLACES }, (_, i) => {
          const repeat = i >= projects.length;
          return (
            <li
              key={i}
              data-orbit-item
              aria-hidden={repeat || undefined}
              style={{ "--i": i, transform: restingTransform } as CSSProperties}
              className="orbit-item absolute top-1/2 left-1/2 size-0 will-change-transform max-sm:last:hidden"
            >
              <ProjectCircle
                project={projects[i % projects.length]}
                repeat={repeat}
              />
            </li>
          );
        })}
      </ul>
      <p
        aria-hidden
        className="absolute top-[calc(50%+var(--ry)+3.5rem)] left-1/2 grid -translate-x-1/2 text-center text-body-sm whitespace-nowrap sm:hidden"
      >
        {projects.map((project, i) => (
          <span
            key={project.slug}
            className={`col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:transition-none ${bottom % projects.length === i ? "" : "opacity-0"}`}
          >
            {project.title}
          </span>
        ))}
      </p>
    </nav>
  );
}
