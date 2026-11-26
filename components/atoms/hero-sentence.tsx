"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MOVING } from "@/lib/motion";

// Next keeps the page alive and re-runs effects when you come back to it.
let introPlayed = false;

export function HeroSentence() {
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOVING, () => {
      gsap.set(heading.current, { autoAlpha: 1 });
      if (introPlayed) return;

      const split = SplitText.create(heading.current, {
        type: "words",
        mask: "words",
        wordsClass: "word",
        aria: "none",
      });
      gsap.from(split.words, {
        yPercent: 115,
        duration: 0.6,
        stagger: 0.03,
        delay: 0.5,
        ease: "power3.out",
        onComplete: () => {
          introPlayed = true;
          split.revert();
        },
      });
    });
  });

  return (
    <h1
      ref={heading}
      data-intro
      className="max-w-40 text-center text-body-strong text-balance sm:max-w-[min(416px,40vw)] sm:text-h3"
    >
      Frontend student building{" "}
      <span className="sm:hidden">thoughtful</span>
      <span className="max-sm:hidden">thoughtful, fast and playful</span> web
      experiences.
    </h1>
  );
}
