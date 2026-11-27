"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Artwork } from "@/components/atoms/artwork";
import { COVER_BOX, COVER_TOP } from "@/components/molecules/project-cover";
import {
  type Box,
  COVER,
  type CoverParts,
  type CoverStart,
  connectLayer,
  mixBox,
  phase,
  pictureSize,
} from "@/lib/cover";
import { onFrame } from "@/lib/frame";
import { gsap } from "@/lib/gsap";
import { STILL } from "@/lib/motion";
import { mockupFit } from "@/lib/orbit";
import { scrollToY } from "@/lib/scroll";

type Run = {
  start: CoverStart;
  from: Box;
  target: string;
  parts: CoverParts | null;
  t0?: number;
  pushed: boolean;
  ended: boolean;
  stop?: () => void;
};

const growEase = gsap.parseEase("power3.out");

function boxOf(el: HTMLElement, r?: number): Box {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: left, y: top, w: width, h: height, r: r ?? parseFloat(getComputedStyle(el).borderTopLeftRadius) };
}

/**
 * Grows a clicked circle or card into the case page's cover (spec 2026-11-27-project-case-design.md).
 * Lives in the layout, so it stays while the page changes under it.
 */
export function CoverLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const [shown, setShown] = useState<CoverStart | null>(null);
  const run = useRef<Run | null>(null);
  const veil = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    const r = run.current;
    if (!r) return;
    r.stop?.();
    gsap.killTweensOf([veil.current, copy.current]);
    r.start.source.style.removeProperty("visibility");
    run.current = null;
    setShown(null);
  }, []);

  // Back, or another page than the one we are going to: drop the copy at once, title included.
  const abort = useCallback(() => {
    const parts = run.current?.parts;
    if (parts) gsap.set(parts.title, { clearProps: "transform,opacity" });
    finish();
  }, [finish]);

  useEffect(() => {
    // A back that does not change the pathname (a hash, or before the push has landed).
    addEventListener("popstate", abort);
    const disconnect = connectLayer({
      start(s) {
        if (run.current) return true; // one at a time: a second click is swallowed
        if (matchMedia(STILL).matches) return false;
        // Mid-flight between ring and grid, a card's box is not what shows: go as a plain link.
        if (s.source.hasAttribute("data-flying")) return false;
        const from = boxOf(s.source, s.round ? s.source.getBoundingClientRect().width / 2 : undefined);
        s.source.style.visibility = "hidden";
        run.current = { start: s, from, target: `/projects/${s.project.slug}`, parts: null, pushed: false, ended: false };
        setShown(s);
        return true;
      },
      arrive(parts) {
        const r = run.current;
        if (!r || r.ended) return; // after giving up, the page shows as it is
        r.parts = parts;
        gsap.set(parts.title, { y: COVER.titleRise, opacity: 0 });
        scrollToY(0); // Next scrolls the new page to the top; Lenis follows
      },
    });
    return () => {
      removeEventListener("popstate", abort);
      disconnect();
    };
  }, [abort]);

  useEffect(() => {
    if (run.current && pathname !== run.current.target) abort();
  }, [pathname, abort]);

  useLayoutEffect(() => {
    const r = run.current;
    if (!shown || !r) return;
    const goal = boxOf(target.current!); // where the cover will be, before the page exists
    const { mockup } = shown.project;

    const draw = (t: number) => {
      const to = r.parts ? boxOf(r.parts.cover) : goal; // the real cover, wherever scrolling puts it
      const box = mixBox(r.from, to, t);
      const el = copy.current!;
      el.style.transform = `translate(${box.x}px, ${box.y}px)`;
      el.style.width = `${box.w}px`;
      el.style.height = `${box.h}px`;
      el.style.borderRadius = `${box.r}px`;
      if (mockup) el.style.setProperty("--art-scale", String(mockupFit(mockup, box.w, box.h)));
      if (picture.current) {
        const pic = pictureSize(r.from, to, t);
        picture.current.style.width = `${pic.w}px`;
        picture.current.style.height = `${pic.h}px`;
      }
    };
    draw(0);
    gsap.fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: COVER.veilIn, ease: "power1.out" });

    r.stop = onFrame((time) => {
      r.t0 ??= time;
      const elapsed = (time - r.t0) / 1000;
      if (!r.pushed && elapsed >= COVER.veilIn) {
        r.pushed = true; // behind the closed veil, so the page change never shows
        router.push(r.target);
      }
      draw(growEase(Math.min(1, elapsed / COVER.grow)));
      if (r.ended) return;

      const now = phase(elapsed, Boolean(r.parts));
      if (now === "land") {
        r.ended = true;
        gsap.to(veil.current, { opacity: 0, duration: COVER.veilOut, ease: "power1.inOut", onComplete: () => finish() });
        gsap.fromTo(
          r.parts!.title,
          { y: COVER.titleRise, opacity: 0 },
          { y: 0, opacity: 1, duration: COVER.titleTime, ease: "power3.out" },
        );
      } else if (now === "giveUp") {
        r.ended = true;
        gsap.to([veil.current, copy.current], { opacity: 0, duration: COVER.veilOut, onComplete: () => finish() });
      }
    });
  }, [shown, router, finish]);

  // Nothing pinned while idle: a full-width fixed layer at the top tints Safari's status bar.
  if (!shown) return null;
  const { project, sizes } = shown;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[29]">
      <div ref={veil} className="pointer-events-auto absolute inset-0 bg-bg-page opacity-0" />
      <div
        ref={copy}
        style={{ backgroundColor: project.color }}
        className="absolute top-0 left-0 overflow-hidden will-change-transform @container-size"
      >
        {project.image ? (
          <div ref={picture} className="absolute top-1/2 left-1/2 -translate-1/2">
            <Image src={project.image} alt="" fill sizes={sizes} loading="eager" className="object-cover" />
            {/* The cover's own size, over the small one already loaded, once it is here. */}
            <Image
              src={project.image}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              onLoad={(event) => (event.currentTarget.style.opacity = "1")}
              className="object-cover opacity-0 transition-opacity duration-300"
            />
          </div>
        ) : (
          <Artwork project={project} sizes={sizes} />
        )}
      </div>
      <div className={`invisible absolute inset-x-0 top-0 ${COVER_TOP}`}>
        <div ref={target} className={COVER_BOX} />
      </div>
    </div>
  );
}
