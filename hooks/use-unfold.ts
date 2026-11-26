import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { STILL } from "@/lib/motion";

/** A card that unfolds from its button, followed by everything marked data-unfold-item. */
export function useUnfold() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLElement>(null);
  const unfold = useRef<gsap.core.Timeline>(null);
  const shape = useRef({ width: 0, height: 0 });

  useGSAP(
    () => {
      const el = card.current;
      const from = button.current?.getBoundingClientRect();
      if (!el || !from || (!open && !unfold.current)) return;

      const items = el.querySelectorAll("[data-unfold-item]");
      unfold.current?.kill();

      if (matchMedia(STILL).matches) {
        gsap.set(shape.current, { width: 0, height: 0 });
        gsap.set([el, ...items], { clearProps: "all" });
        unfold.current = gsap
          .timeline()
          .set(el, { visibility: open ? "visible" : "hidden" });
        return;
      }

      // One number per direction: browsers shorten clip-path, so GSAP cannot tween it as text.
      const to = el.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius);
      const draw = () => {
        const x = 1 - shape.current.width;
        const y = 1 - shape.current.height;
        const top = (from.top - to.top) * y;
        const right = (to.right - from.right) * x;
        const bottom = (to.bottom - from.bottom) * y;
        const left = (from.left - to.left) * x;
        const round = radius + (from.height / 2 - radius) * y;
        el.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${round}px)`;
      };

      if (open) {
        if (!shape.current.width) gsap.set(items, { opacity: 0 });
        draw();
        unfold.current = gsap
          .timeline({ onUpdate: draw, defaults: { ease: "power2.inOut" } })
          .set(el, { visibility: "visible" }, 0)
          .to(shape.current, { width: 1, duration: 0.45 }, 0)
          .to(shape.current, { height: 1, duration: 0.5 }, 0.1)
          .to(
            items,
            { opacity: 1, duration: 0.3, stagger: 0.04, ease: "none" },
            0.35,
          );
      } else {
        unfold.current = gsap
          .timeline({ onUpdate: draw, defaults: { ease: "power2.inOut" } })
          .to(items, { opacity: 0, duration: 0.15, ease: "none" }, 0)
          .to(shape.current, { height: 0, duration: 0.4 }, 0)
          .to(shape.current, { width: 0, duration: 0.4 }, 0.1)
          .set(el, { visibility: "hidden" });
      }
    },
    { dependencies: [open] },
  );

  // Closes on a press outside, Escape, or after scrolling a good way past.
  useEffect(() => {
    if (!open) return;

    const startY = window.scrollY;
    const abort = new AbortController();
    const { signal } = abort;

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!root.current?.contains(event.target as Node)) setOpen(false);
      },
      { signal },
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") return;
        if (root.current?.contains(document.activeElement))
          button.current?.focus();
        setOpen(false);
      },
      { signal },
    );
    window.addEventListener(
      "scroll",
      () => {
        if (Math.abs(window.scrollY - startY) > 1000) setOpen(false);
      },
      { signal, passive: true },
    );
    return () => abort.abort();
  }, [open]);

  return { open, setOpen, root, button, card };
}
