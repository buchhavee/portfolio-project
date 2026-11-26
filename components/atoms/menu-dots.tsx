"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { STILL } from "@/lib/motion";

const DIAGONALS = [[0], [1, 3], [2, 4, 6], [5, 7], [8]];
const DIMMED = {
  grid: [],
  plus: [0, 2, 6, 8],
  cross: [1, 3, 5, 7],
} satisfies Record<string, number[]>;

/** The 3x3 dots. A wave runs across the diagonals whenever the shape changes. */
export function MenuDots({ shape }: { shape: keyof typeof DIMMED }) {
  const svg = useRef<SVGSVGElement>(null);
  const previous = useRef(shape);

  useGSAP(
    () => {
      if (!svg.current || previous.current === shape) return;
      previous.current = shape;

      const dots = svg.current.querySelectorAll("circle");
      const dimmed: number[] = DIMMED[shape];
      const reduced = matchMedia(STILL).matches;
      DIAGONALS.forEach((diagonal, step) =>
        diagonal.forEach((i) => {
          const opacity = dimmed.includes(i) ? 0.25 : 1;
          gsap.killTweensOf(dots[i]);
          if (reduced) gsap.set(dots[i], { opacity });
          else
            gsap.to(dots[i], {
              keyframes: [
                { opacity: 0.25, duration: 0.15, ease: "power2.out" },
                { opacity, duration: 0.15, ease: "power2.in" },
              ],
              delay: step * 0.06,
            });
        }),
      );
    },
    { dependencies: [shape] },
  );

  return (
    <svg ref={svg} viewBox="0 0 44 44" className="size-11" aria-hidden>
      {[13.5, 22.5, 31.5].flatMap((y) =>
        [13.5, 22.5, 31.5].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} fill="currentColor" />
        )),
      )}
    </svg>
  );
}
