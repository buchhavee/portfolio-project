import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { bottomIndex, FULL_TURN, orbitPoint } from "@/lib/orbit";

const LAP = 60;
const BRAKE = 1.6;
const ACCELERATE = 2.4;
const TITLE_ARC = (3 / LAP) * FULL_TURN; // what a circle travels in 3 seconds

// Next keeps the page alive and re-runs effects when you come back to it.
let introPlayed = false;

/**
 * Turns the ring. Expects items marked data-orbit-item, each with a link and a data-orbit-label.
 * On mobile, onBottom hears which circle is passing the bottom, or -1.
 */
export function useOrbit(
  ring: RefObject<HTMLElement | null>,
  onBottom: (index: number) => void,
) {
  useGSAP(() => {
    gsap.matchMedia().add(
      {
        still: "(prefers-reduced-motion: reduce)",
        motion: "(prefers-reduced-motion: no-preference)",
        wide: "(min-width: 40rem)", // one circle fewer below this
      },
      (context) => {
        const root = ring.current;
        if (!root || !context.conditions) return;
        const { still, wide } = context.conditions;

        const items = gsap.utils
          .toArray<HTMLElement>("[data-orbit-item]", root)
          .filter((item) => item.offsetParent);

        // One clock turns the whole ring, so the circles cannot drift apart.
        const clock = { angle: 0 };
        const point = (index: number) =>
          orbitPoint(clock.angle, index, items.length);

        let bottom = -1;
        const report = (index: number) => {
          if (wide || index === bottom) return;
          bottom = index;
          onBottom(index);
        };
        const nowAtBottom = () =>
          bottomIndex(clock.angle, items.length, TITLE_ARC);
        if (still) {
          report(nowAtBottom());
          return;
        }

        const place = () => {
          items.forEach((item, i) => {
            const { x, y, depth } = point(i);
            item.style.transform = `translate(calc(${x.toFixed(6)} * var(--rx)), calc(${y.toFixed(6)} * var(--ry))) scale(${depth.toFixed(4)})`;
          });
          report(spin.timeScale() < 2 ? nowAtBottom() : -1); // not during the intro
        };
        const spin = gsap.to(clock, {
          angle: FULL_TURN,
          duration: LAP,
          ease: "none",
          repeat: -1,
          onUpdate: place,
        });

        // Every change of speed starts from the current speed.
        const setSpeed = (timeScale: number, duration: number, ease: string) =>
          gsap.to(spin, { timeScale, duration, ease, overwrite: true });

        if (introPlayed) {
          gsap.set(root, { autoAlpha: 1 });
        } else {
          gsap.fromTo(
            root,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1.5,
              ease: "power2.out",
              onComplete: () => {
                introPlayed = true;
              },
            },
          );
          spin.timeScale(30);
          setSpeed(1, 3, "power3.out");
        }

        const abort = new AbortController();
        const { signal } = abort;
        items.forEach((item, i) => {
          const link = item.querySelector("a");
          const label = item.querySelector<HTMLElement>("[data-orbit-label]");
          if (!link || !label) return;

          const stop = () => {
            label.style.scale = `${1 / point(i).depth}`; // same text size at any depth
            setSpeed(0, BRAKE, "power2.out");
          };
          // Only asks about the other kind of attention: while an event runs, Firefox
          // still reports the link it left as hovered.
          const goUnless = (held: string) => {
            if (!root.querySelector(held))
              setSpeed(1, ACCELERATE, "power2.inOut");
          };

          link.addEventListener(
            "pointerenter",
            (event) => event.pointerType === "mouse" && stop(),
            { signal },
          );
          link.addEventListener(
            "pointerleave",
            () => goUnless("a:focus-visible"),
            { signal },
          );
          link.addEventListener(
            "focus",
            () => link.matches(":focus-visible") && stop(),
            { signal },
          );
          link.addEventListener("blur", () => goUnless("a:hover"), { signal });
        });
        return () => {
          abort.abort();
          onBottom(-1);
        };
      },
    );
  });
}
