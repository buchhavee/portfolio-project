export type Project = {
  slug: string;
  title: string;
  type: string;
  image: string;
  /** Shown until the image has loaded. */
  color: string;
};

// The ring repeats these until it is full.
export const projects: Project[] = [
  {
    slug: "cc-design",
    title: "C.C. Design A/S",
    type: "Website redesign",
    image: "/images/projects/cc-design.webp",
    color: "#606e77",
  },
  {
    slug: "9t7",
    title: "9t7",
    type: "Website redesign",
    image: "/images/projects/9t7.webp",
    color: "#424242",
  },
];
