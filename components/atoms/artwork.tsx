import Image from "next/image";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  sizes: string;
};

// The phone's screen in Figma (Artwork, 17:60): left, top, width, height, radius, colour.
const screen = [
  [56, 10, 52, 14, 7, "#12110d"],
  [16, 44, 80, 8, 3, "#12110d"],
  [16, 70, 132, 16, 4, "#12110d"],
  [16, 92, 100, 16, 4, "#12110d"],
  [16, 122, 132, 110, 12, "#e9e9e4"],
  [16, 244, 62, 62, 10, "#efefeb"],
  [86, 244, 62, 62, 10, "#efefeb"],
  [16, 318, 132, 24, 12, "#3355ff"],
] as const;

/** A project's picture, or a browser or phone until there is one. Expects a size container around it. */
export function Artwork({ project, sizes }: Props) {
  const centred = "absolute top-1/2 left-1/2 -translate-1/2";

  if (project.image)
    return (
      // Square, so it covers a circle and a card alike when scaled.
      <div data-art="image" className={`${centred} size-[max(100cqw,100cqh)]`}>
        <Image
          src={project.image}
          alt=""
          fill
          sizes={sizes}
          loading="eager" // shown up in the ring long before its place in the grid is near
          className="object-cover"
        />
      </div>
    );

  if (project.mockup === "browser")
    return (
      <div
        data-art="browser"
        className={`${centred} h-[340px] w-[520px] [scale:var(--art-scale,1)]`}
      >
        {/* The shadow reaches past the window. */}
        <div className="absolute inset-[-4.71%_-7.69%_-18.82%_-7.69%]">
          <Image
            src="/images/artwork/browser.svg"
            alt=""
            fill
            loading="eager"
          />
        </div>
      </div>
    );

  return (
    <div
      data-art="phone"
      className={`${centred} h-[370px] w-[180px] [scale:var(--art-scale,1)] overflow-clip rounded-[32px] bg-[#12110d] shadow-[0_24px_48px_-8px_rgb(0_0_0/0.18)]`}
    >
      <div className="absolute top-2 left-2 h-[354px] w-[164px] overflow-clip rounded-[26px] bg-white">
        {screen.map(([left, top, width, height, radius, color]) => (
          <div
            key={`${left},${top}`}
            className="absolute"
            style={{
              left,
              top,
              width,
              height,
              borderRadius: radius,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
