"use client";

import { type CSSProperties, useRef } from "react";
import { clips, FLAP, flipAt, moves, sequence } from "@/lib/flap";
import { gsap, useGSAP } from "@/lib/gsap";
import { STILL } from "@/lib/motion";

type Cell = {
  el: HTMLElement;
  top: HTMLElement;
  bottom: HTMLElement;
  fold: HTMLElement;
  land: HTMLElement;
  seq: string[];
  turn: number;
  step: number;
};

const vars = {
  "--flap-split": `${Math.round(FLAP.split * 100)}%`,
  "--flap-perspective": `${FLAP.perspective}em`,
} as CSSProperties;

const write = (el: HTMLElement, text: string) => {
  if (el.textContent !== text) el.textContent = text;
};

/** Text whose letters flip like a departure board when the link or button around it is hovered or focused. */
export function FlapText({ text }: { text: string }) {
  const root = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current;
      const trigger = el?.closest<HTMLElement>("a, button");
      if (!el || !trigger || !contextSafe) return;

      let tween: gsap.core.Tween | undefined;
      let lineHeight = 0; // in em, read on the first hover

      const play = contextSafe(() => {
        if (tween?.isActive() || matchMedia(STILL).matches) return;
        if (!lineHeight) {
          const css = getComputedStyle(el);
          lineHeight = parseFloat(css.lineHeight) / parseFloat(css.fontSize) || 1.2;
        }

        const cells: Cell[] = [...el.querySelectorAll<HTMLElement>(".flap-cell")].map((cell) => {
          const [whole, top, bottom, fold, land] = [...cell.children] as HTMLElement[];
          const seq = sequence(whole.textContent ?? "", FLAP.flips);
          return { el: cell, top, bottom, fold, land, seq, turn: 0, step: -1 };
        });

        const draw = () => {
          for (const cell of cells) {
            const steps = cell.seq.length - 1;
            if (!cell.turn || cell.step === steps) continue; // not started yet, or landed
            if (cell.turn >= steps) {
              cell.step = steps;
              delete cell.el.dataset.flipping;
              for (const layer of [cell.top, cell.bottom, cell.fold, cell.land]) layer.style.cssText = "";
              continue;
            }
            const { step, angle } = flipAt(cell.turn, steps);
            if (step !== cell.step) {
              cell.step = step;
              write(cell.top, cell.seq[step + 1]);
              write(cell.bottom, cell.seq[step]);
              write(cell.fold, cell.seq[step]);
              write(cell.land, cell.seq[step + 1]);
              cell.el.dataset.flipping = "";
            }
            cell.fold.style.transform = `rotateX(${-Math.min(angle, 90)}deg)`;
            cell.land.style.transform = `rotateX(${Math.min(90, 180 - angle)}deg)`;
            const { top, bottom } = clips(angle, lineHeight);
            cell.top.style.clipPath = top;
            cell.bottom.style.clipPath = bottom;
          }
        };

        tween = gsap.to(cells, {
          turn: FLAP.flips + 1,
          duration: FLAP.duration,
          ease: FLAP.ease,
          stagger: FLAP.stagger,
          onUpdate: draw,
        });
      });

      // A mouse starts it by hovering, a keyboard by focusing. A tap on a touch screen does not.
      const onEnter = (event: PointerEvent) => {
        if (event.pointerType === "mouse") play();
      };
      const onFocus = () => {
        if (trigger.matches(":focus-visible")) play();
      };
      trigger.addEventListener("pointerenter", onEnter);
      trigger.addEventListener("focus", onFocus);
      return () => {
        trigger.removeEventListener("pointerenter", onEnter);
        trigger.removeEventListener("focus", onFocus);
        // Next hides a page it leaves (Activity) but keeps its DOM, so land any letter caught mid-flip.
        for (const cell of el.querySelectorAll<HTMLElement>(".flap-cell")) {
          delete cell.dataset.flipping;
          for (const layer of cell.children) (layer as HTMLElement).style.cssText = "";
        }
      };
    },
    { scope: root },
  );

  return (
    <span ref={root} style={vars}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="whitespace-nowrap">
        {[...text].map((char, i) =>
          moves(char) ? (
            <span key={i} className="flap-cell">
              <span className="flap-whole">{char}</span>
              <span className="flap-top">{char}</span>
              <span className="flap-bottom">{char}</span>
              <span className="flap-fold">{char}</span>
              <span className="flap-land">{char}</span>
            </span>
          ) : (
            char
          ),
        )}
      </span>
    </span>
  );
}
