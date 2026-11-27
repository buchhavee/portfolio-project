"use client";

import { useRef } from "react";
import { Button } from "@/components/atoms/button";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MOVING } from "@/lib/motion";

// Next keeps the page alive and re-runs effects when you come back to it.
let introPlayed = false;

export function AboutTeaser() {
  const text = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOVING, () => {
      gsap.set(text.current, { autoAlpha: 1 });
      if (introPlayed) return;

      // The same rise as the hero sentence, played once when the text scrolls into view.
      const split = SplitText.create(text.current, {
        type: "words",
        mask: "words",
        wordsClass: "word",
        aria: "none",
      });
      gsap.from(split.words, {
        yPercent: 115,
        duration: 0.6,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: { trigger: text.current, start: "top 85%", once: true },
        onComplete: () => {
          introPlayed = true;
          split.revert();
        },
      });
    });
  });

  return (
    <section className="flex flex-col gap-6 px-4 pt-12 pb-16 md:flex-row md:gap-16 md:px-6 md:py-24">
      <h2 className="text-caps text-text-secondary uppercase md:w-1/3 md:max-w-110 md:shrink-0">
        About
      </h2>
      <div className="flex flex-col items-start gap-6 md:gap-8">
        <p ref={text} data-intro className="max-w-205 text-h3 md:text-h2">
          I’m Mads, a student who designs and builds for the web.{" "}
          <span className="max-md:hidden">
            I care about clean code, smooth motion and details that make a site
            feel right.
          </span>
        </p>
        <Button href="/about" label="More about me" />
      </div>
    </section>
  );
}
