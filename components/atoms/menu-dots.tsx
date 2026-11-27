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
  const root = useRef<HTMLSpanElement>(null);
  const previous = useRef(shape);

  useGSAP(
    () => {
      if (!root.current || previous.current === shape) return;
      previous.current = shape;

      const dots = root.current.querySelectorAll("circle");
      const dimmed: number[] = DIMMED[shape];
      const reduced = matchMedia(STILL).matches;
      DIAGONALS.forEach((diagonal, step) =>
        diagonal.forEach((i) => {
          const opacity = dimmed.includes(i) ? 0.25 : 1;
          const pair = [dots[i], dots[i + 9]]; // the same dot in both copies
          gsap.killTweensOf(pair);
          if (reduced) gsap.set(pair, { opacity });
          else
            gsap.to(pair, {
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

  const dots = (className: string) => (
    <svg viewBox="0 0 44 44" className={`size-11 ${className}`} aria-hidden>
      {[13.5, 22.5, 31.5].flatMap((y) =>
        [13.5, 22.5, 31.5].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} fill="currentColor" />
        )),
      )}
    </svg>
  );

  // Drawn twice: the copy in the footer's ink shows where the footer lies under the dots (globals.css).
  return (
    <span ref={root} className="relative block">
      {dots("ink-above")}
      {dots("absolute top-0 left-0 text-text-inverse ink-below")}
    </span>
  );
}
