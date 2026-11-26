"use client";

import Link from "next/link";
import { useRef } from "react";
import { CopyButton } from "@/components/atoms/copy-button";
import { FlapText } from "@/components/atoms/flap-text";
import { elsewhereLinks, email, mainLinks } from "@/data/site";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MOVING } from "@/lib/motion";

/** On every page. Its id lets the contact pill step aside when it shows. */
export function Footer() {
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOVING, () => {
      const el = heading.current;
      if (!el) return;
      gsap.set(el, { autoAlpha: 1 });

      // The same rise as the About teaser, played once.
      const split = SplitText.create(el, {
        type: "words",
        mask: "words",
        wordsClass: "word",
        aria: "none",
      });
      const rise = gsap.from(split.words, {
        yPercent: 115,
        duration: 0.6,
        stagger: 0.03,
        ease: "power3.out",
        paused: true,
        onComplete: () => split.revert(),
      });

      // An observer, not ScrollTrigger: the layout keeps the footer while pages of other heights
      // come and go, and a trigger would keep the position it measured on the first one.
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          rise.play();
          observer.disconnect();
        },
        { rootMargin: "0px 0px -15% 0px" },
      );
      observer.observe(el);
      return () => observer.disconnect();
    });
  });

  return (
    <footer id="footer" className="px-2 pb-2 md:px-6 md:pb-6">
      <div className="flex flex-col gap-14 rounded-xl bg-bg-inverse px-6 pt-12 pb-7 text-text-inverse md:gap-24 md:px-14 md:pt-18 md:pb-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex flex-col items-start gap-6 md:gap-8">
            <h2 ref={heading} data-intro className="text-h1 md:text-display-l">
              Let’s build
              <br />
              something.
            </h2>
            <div className="flex items-center gap-4">
              <a href={`mailto:${email}`} className="text-body-l md:text-h3">
                {email}
              </a>
              <CopyButton text={email} />
            </div>
          </div>

          <div className="flex gap-12 md:gap-20">
            <div>
              <p className="mb-3 text-caps text-text-inverse-secondary uppercase">Pages</p>
              <ul className="dim-siblings flex flex-col gap-3 text-body md:text-body-l">
                {mainLinks.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} prefetch={false /* the pages do not exist yet */}>
                      <FlapText text={label} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-caps text-text-inverse-secondary uppercase">Elsewhere</p>
              <ul className="dim-siblings flex flex-col gap-3 text-body md:text-body-l">
                {elsewhereLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener">
                      <FlapText text={label} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-inverse pt-6 text-body-sm md:flex-row md:items-center md:justify-between">
          <p className="flex items-start gap-2.5 md:items-center">
            {/* centred on the first line when the text wraps */}
            <span className="mt-[0.35em] size-2.5 shrink-0 rounded-full bg-accent-default md:mt-0" />
            Open to a frontend internship from autumn 2027
          </p>
          <p className="text-text-inverse-secondary">© 2026 Mads · Designed and built by me</p>
        </div>
      </div>
    </footer>
  );
}
