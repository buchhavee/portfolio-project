"use client";

import { useState } from "react";
import { MenuDots } from "@/components/atoms/menu-dots";
import { ThemeSwitch } from "@/components/atoms/theme-switch";
import { MenuCard } from "@/components/molecules/menu-card";
import { useUnfold } from "@/hooks/use-unfold";

export function Menu() {
  const { open, setOpen, root, button, card } = useUnfold();
  const [hovered, setHovered] = useState(false);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      {/* hidden, not only transparent, so Safari does not paint its bars from it */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-bg-page/65 transition-[opacity,visibility] duration-300 motion-reduce:transition-none sm:hidden ${open ? "" : "pointer-events-none invisible opacity-0"}`}
      />
      <div
        data-ink
        className={`ink-on-card relative z-10 flex ${open ? "[--on-card:1]" : "delay-350 motion-reduce:delay-0"}`}
      >
        <ThemeSwitch />
        <button
          ref={button}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen(!open)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="block cursor-pointer rounded-full"
        >
          <MenuDots shape={open ? "cross" : hovered ? "plus" : "grid"} />
        </button>
      </div>
      <nav
        ref={card}
        id="menu"
        aria-label="Main"
        inert={!open}
        className={`invisible absolute -top-2 -right-2 w-[calc(100vw-1rem)] rounded-xl bg-bg-inverse text-text-inverse transition-opacity duration-150 motion-reduce:transition-none sm:w-75 ${open ? "" : "opacity-0 delay-350 motion-reduce:delay-0"}`}
      >
        <MenuCard onNavigate={close} />
      </nav>
    </div>
  );
}
