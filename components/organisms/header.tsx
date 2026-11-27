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
        const { top, height } = boxes[i];
        const value = `${Math.min(Math.max(edge - top, -1), height + 1).toFixed(1)}px`;
        if (el.style.getPropertyValue("--ink-edge") !== value) el.style.setProperty("--ink-edge", value);
        // The logo needs background-clip: text only while the edge crosses it.
        const state = edge <= top ? "covered" : edge < top + height ? "split" : "";
        if ((el.dataset.ink ?? "") !== state) el.dataset.ink = state;
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

  // Logo and menu are pinned each on their own, not in one full-width fixed bar: under such a bar
  // with content, iOS 26 Safari paints its status bar solid and keeps the colour through a theme switch.
  return (
    <header ref={header}>
      <div className="fixed top-3.5 left-4 z-40 flex h-11 items-center sm:top-6 sm:left-8">
        <Logo />
      </div>
      <div className="fixed top-3.5 right-4 z-40 sm:top-6 sm:right-8">
        <Menu />
      </div>
    </header>
  );
}
