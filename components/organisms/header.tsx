"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/molecules/logo";
import { Menu } from "./menu";

export function Header() {
  const header = useRef<HTMLElement>(null);

  // Tells the logo and the buttons where the footer starts under them (--ink-edge, from their own top),
  // so the part that lies on it takes its ink (.ink-split, .ink-above and .ink-below in globals.css).
  useEffect(() => {
    const footer = document.getElementById("footer");
    const inked = [...(header.current?.querySelectorAll<HTMLElement>("[data-ink]") ?? [])];
    if (!footer || !inked.length) return;

    const update = () => {
      const edge = footer.getBoundingClientRect().top;
      const boxes = inked.map((el) => el.getBoundingClientRect()); // every read before the first write
      inked.forEach((el, i) => {
        const value = `${Math.min(Math.max(edge - boxes[i].top, -1), boxes[i].height + 1).toFixed(1)}px`;
        if (el.style.getPropertyValue("--ink-edge") !== value) el.style.setProperty("--ink-edge", value);
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      ref={header}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-4 pt-3.5 *:pointer-events-auto sm:px-8 sm:pt-6"
    >
      <div className="flex h-11 items-center pt-1">
        <Logo />
      </div>
      <Menu />
    </header>
  );
}
