export type Mockup = "browser" | "phone";

export type Project = {
  slug: string;
  title: string;
  type: string;
  year?: string;
  tech?: string[];
  /** The card's background, and the circle's until the image has loaded. */
  color: string;
} & ({ image: string; mockup?: never } | { mockup: Mockup; image?: never });

const placeholder = (number: number, color: string, mockup: Mockup): Project => ({
  slug: `project-0${number}`,
  title: `Project 0${number}`,
  type: "School",
  year: "2026",
  tech: ["React", "TypeScript"],
  color,
  mockup,
});

// One per circle in the ring and card in the grid, in that order.
export const projects: Project[] = [
  {
    slug: "cc-design",
    title: "C.C. Design A/S",
    type: "Website redesign",
    image: "/images/projects/cc-design.webp",
    color: "#606e77",
  },
  {
    slug: "wash-world",
    title: "Wash World",
    type: "School exam, Web dev",
    year: "2026",
    tech: ["Figma"],
    image: "/images/projects/wash-world.webp",
    color: "#a0c4ff",
  },
  placeholder(3, "#dcefe1", "phone"),
  placeholder(4, "#d6e8f7", "phone"),
  placeholder(5, "#f6dfe6", "phone"),
  {
    slug: "kc-wine",
    title: "Kahlenberg & Christiansen",
    type: "School exam, MMD",
    year: "2025",
    tech: ["React", "TypeScript"],
    image: "/images/projects/kc-wine.webp",
    color: "#1e2a6b",
  },
  {
    slug: "appstract",
    title: "Appstract",
    type: "Internship",
    year: "2026",
    tech: ["React", "TypeScript"],
    image: "/images/projects/appstract.webp",
    color: "#f7e4d4",
  },
  placeholder(8, "#e6dff6", "phone"),
  {
    slug: "9t7",
    title: "9t7",
    type: "Website redesign",
    image: "/images/projects/9t7.webp",
    color: "#424242",
  },
];

/** "School · 2026 · React, TypeScript", leaving out what is not known yet. */
export function metaLine({ type, year, tech }: Pick<Project, "type" | "year" | "tech">) {
  return [type, year, tech?.join(", ")].filter(Boolean).join(" · ");
}
