"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { FlapText } from "@/components/atoms/flap-text";
import { contactLinks } from "@/data/site";
import { useUnfold } from "@/hooks/use-unfold";

export function ContactPill() {
  const { open, setOpen, root, button, card } = useUnfold();
  const hovering = useRef(false);
  const [away, setAway] = useState(false);

  // Steps aside while the footer shows: it has the email, and the pill would cover its bottom line.
  useEffect(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => {
      setAway(entry.isIntersecting);
      if (!entry.isIntersecting) return;
      setOpen(false);
      hovering.current = false;
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, [setOpen]);

  // A mouse opens it by hovering. Touch and keyboard press the button.
  const onHover = (event: PointerEvent, inside: boolean) => {
    if (event.pointerType !== "mouse") return;
    hovering.current = inside;
    setOpen(inside);
  };

  return (
    <div
      ref={root}
      onPointerEnter={(event) => onHover(event, true)}
      onPointerLeave={(event) => onHover(event, false)}
      inert={away}
      className={`fixed bottom-4 left-4 z-30 transition-transform duration-500 ease-in-out motion-reduce:transition-none sm:bottom-8 sm:left-8 ${away ? "translate-y-[200%]" : ""}`}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="contact"
        onClick={() => {
          if (!hovering.current) setOpen(!open);
        }}
        className="relative z-10 block h-[49px] cursor-pointer rounded-full bg-bg-inverse px-6 text-body-strong text-text-inverse"
      >
        <FlapText text="Let's talk" />
      </button>
      {/* Full size from the start, so the mouse can move up before the card has grown. */}
      <div
        className={`absolute bottom-0 left-0 w-75 ${open ? "" : "pointer-events-none"}`}
      >
        <address
          ref={card}
          id="contact"
          inert={!open}
          className="invisible rounded-[24.5px] bg-bg-inverse px-6 pt-6 pb-18 text-text-inverse not-italic"
        >
          <ul className="dim-siblings flex flex-col gap-5">
            {contactLinks.map(({ label, text, href }) => (
              <li key={label} data-unfold-item>
                <a href={href} className="block">
                  <span className="mb-1 block text-caps text-text-inverse-secondary uppercase">
                    <FlapText text={label} />
                  </span>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </address>
      </div>
    </div>
  );
}
