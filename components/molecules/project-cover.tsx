"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { Artwork } from "@/components/atoms/artwork";
import type { Project } from "@/data/projects";
import { coverArrived } from "@/lib/cover";
import { mockupFit } from "@/lib/orbit";

// Shared with the cover layer, which measures where the cover will be before the page exists.
export const COVER_TOP = "pt-18 md:pt-24";
export const COVER_BOX =
  "relative mx-4 h-120 overflow-hidden rounded-xl @container-size md:mx-6 md:h-[max(320px,100svh-340px)]";

/** The case page's cover, under the logo, with the title under it. */
export function ProjectCover({ project }: { project: Project }) {
  const box = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  // Before the first paint, so the layer can hide the title before it shows.
  useLayoutEffect(() => {
    coverArrived({ cover: box.current!, title: title.current! });
  }, []);

  // A mockup fits the cover the same way it fits the growing copy, so nothing jumps when it lands.
  const { mockup } = project;
  useLayoutEffect(() => {
    const el = box.current;
    if (!mockup || !el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      el.style.setProperty("--art-scale", String(mockupFit(mockup, width, height)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mockup]);

  return (
    <div className={COVER_TOP}>
      <div ref={box} style={{ backgroundColor: project.color }} className={COVER_BOX}>
        {/* Cropped by the cover itself, not by Artwork's square, which would zoom a wide cover. */}
        {project.image ? (
          <Image src={project.image} alt="" fill sizes="100vw" loading="eager" className="object-cover" />
        ) : (
          <Artwork project={project} sizes="100vw" />
        )}
      </div>
      <h1 ref={title} className="mx-4 mt-4 text-h1 md:mx-6 md:mt-7 md:text-display-l">
        {project.title}
      </h1>
    </div>
  );
}
