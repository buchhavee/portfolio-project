import type { RefObject } from "react";
import { onFrame } from "@/lib/frame";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  bottomIndex,
  cardFrame,
  clamp01,
  finishedAt,
  FULL_TURN,
  inOut,
  mix,
  mockupFit,
  MOTION,
  orbitPoint,
  type Place,
  progress,
  ringGrowth,
  rowDone,
  type Scene,
  sceneOf,
  turnRing,
  wind,
} from "@/lib/orbit";
import { MOVING, STILL } from "@/lib/motion";
import { getScroll, scrollToY, setBrakeEnd } from "@/lib/scroll";

const LAP = 60;
const BRAKE = 1.6;
const ACCELERATE = 2.4;
const TITLE_ARC = (3 / LAP) * FULL_TURN; // what a circle travels in 3 seconds
const MOCKUP_IN_RING = { browser: 0.15, phone: 0.2 }; // in a circle of 100 px

// Next keeps the page alive and re-runs effects when you come back to it.
let introPlayed = false;

type Card = {
  el: HTMLElement;
  frame: HTMLElement;
  art: HTMLElement | null;
  caption: HTMLElement | null;
  mockup?: "browser" | "phone";
  place: Place;
  fit: number;
  key: string;
};

/**
 * Turns the ring, and sends each circle down to become its card in the grid as the page scrolls.
 * Expects items marked data-orbit-item, each with a link and a data-orbit-label, inside
 * [data-hero] in [data-hero-track], and the cards' [data-card-frame] > [data-card] > [data-art].
 * On mobile, onBottom hears which circle is passing the bottom, or -1.
 */
export function useOrbit(
  ring: RefObject<HTMLElement | null>,
  onBottom: (index: number) => void,
) {
  useGSAP(() => {
    gsap.matchMedia().add(
      {
        still: STILL,
        motion: MOVING,
        wide: "(min-width: 40rem)", // the title at the bottom is for phones
      },
      (context) => {
        const root = ring.current;
        if (!root || !context.conditions) return;
        const { still, wide } = context.conditions;

        const items = gsap.utils.toArray<HTMLElement>("[data-orbit-item]", root);
        const hero = root.closest<HTMLElement>("[data-hero]");
        const track = root.closest<HTMLElement>("[data-hero-track]");
        const fade = hero?.querySelector<HTMLElement>("[data-hero-fade]");
        const section = document.querySelector<HTMLElement>("[data-projects]");
        const cards: Card[] = gsap.utils
          .toArray<HTMLElement>("[data-card]")
          .map((el) => ({
            el,
            frame: el.parentElement!,
            art: el.querySelector<HTMLElement>("[data-art]"),
            caption:
              el
                .closest("[data-card-slot]")
                ?.querySelector<HTMLElement>("[data-card-caption]") ?? null,
            mockup: el.dataset.mockup as Card["mockup"],
            place: { cx: 0, cy: 0, w: 0, h: 0, col: 0 },
            fit: 1,
            key: "",
          }));

        // Sizes are read here, never in the frame loop.
        let width = 0;
        let height = 0;
        let hold = 0;
        let rx = 0;
        let ry = 0;
        let size = 100;
        let growth = 1;
        let scene: Scene = { height: 0, release: 1, flight: 1, end: Infinity };
        let firstMeasure = true;
        const measure = () => {
          width = document.documentElement.clientWidth;
          height = hero?.offsetHeight ?? innerHeight;
          hold = (track?.offsetHeight ?? height) - height;
          const style = getComputedStyle(root);
          rx = parseFloat(style.getPropertyValue("--rx")) || 0;
          ry = parseFloat(style.getPropertyValue("--ry")) || 0;
          size = items[0]?.querySelector("a")?.offsetWidth || size;
          growth = ringGrowth({ width, height, rx, ry, size });

          const tops: number[] = [];
          cards.forEach((card) => {
            const r = card.frame.getBoundingClientRect();
            const top = Math.round(r.top + scrollY);
            card.place = {
              cx: r.left + scrollX + r.width / 2,
              cy: r.top + scrollY + r.height / 2,
              w: r.width,
              h: r.height,
              col: tops.filter((other) => other === top).length,
            };
            tops.push(top);
            card.fit = card.mockup
              ? mockupFit(card.mockup, r.width, r.height)
              : 1;
            card.key = ""; // write it again
            if (still && card.art && card.mockup)
              card.art.style.scale = String(card.fit);
          });
          if (cards[0]) {
            scene = sceneOf({
              height,
              hold,
              firstRowY: cards[0].place.cy,
              end: document.documentElement.scrollHeight - innerHeight,
            });
            // Mouse and trackpad are braked until the first row has landed.
            const done = rowDone(cards[0].place.cy, height);
            setBrakeEnd(still ? 0 : done);
            // #projects lands where the first row is finished, not where it starts to grow.
            if (section) {
              const top = section.getBoundingClientRect().top + scrollY;
              section.style.scrollMarginTop = `${top - done}px`;
              // The browser jumped to #projects before this margin existed. A position
              // restored by back or forward stays where it is.
              if (firstMeasure && location.hash === "#projects" && Math.abs(scrollY - top) < 2)
                scrollToY(done);
            }
          }
          firstMeasure = false;
        };
        measure();

        const watch = new ResizeObserver(measure);
        [hero, document.querySelector("[data-projects]"), document.body].forEach(
          (el) => el && watch.observe(el),
        );
        addEventListener("resize", measure);
        let live = true;
        document.fonts.ready.then(() => live && measure()); // not after cleanup: it would set the brake again
        const forget = () => {
          live = false;
          watch.disconnect();
          removeEventListener("resize", measure);
          setBrakeEnd(0);
          section?.style.removeProperty("scroll-margin-top");
        };

        // One clock turns the whole ring, so the circles cannot drift apart.
        const clock = { angle: 0 };
        const point = (index: number) =>
          orbitPoint(clock.angle, index, items.length);

        let bottom = -1;
        const report = (index: number) => {
          if (wide || index === bottom) return;
          bottom = index;
          onBottom(index);
        };
        const nowAtBottom = () =>
          bottomIndex(clock.angle, items.length, TITLE_ARC);
        if (still) {
          report(nowAtBottom());
          return () => {
            forget();
            cards.forEach((card) => card.art?.style.removeProperty("scale"));
          };
        }

        // GSAP only eases the speed. The shared frame loop turns the ring.
        const speed = { value: 1 };
        // Every change of speed starts from the current speed.
        const setSpeed = (value: number, duration: number, ease: string) =>
          gsap.to(speed, { value, duration, ease, overwrite: true });

        let s = getScroll(); // starts where the page is, so a reload half way down does not fly
        let settling = 20; // frames in which the browser may still restore the scroll position
        let windBefore = wind(Math.max(0, s) / scene.release);
        let scrolled = false;
        let faded = "";

        /** Moves a card that has left the ring. Returns false while it is still in the ring. */
        const placeCard = (
          card: Card,
          i: number,
          ringX: number,
          ringY: number,
          scale: number,
        ) => {
          const { el, art, caption } = card;
          const { p, g } = progress(s, card.place, scene);
          const circle = items[i];

          if (p <= 0) {
            if (card.key !== "ring") {
              card.key = "ring";
              el.style.opacity = "0"; // not hidden: Tab still reaches it, and scrolls it into place
              el.style.pointerEvents = "none";
              el.style.willChange = "";
              el.dataset.flying = "";
              circle.style.visibility = "";
            }
            return false;
          }

          const { x, y, depth } = point(i);
          const f = cardFrame(p, g, card.place, {
            x: ringX + x * scale * rx,
            y: ringY + y * scale * ry,
            d: size * depth,
          });
          const landed = p >= 1 && g >= 1;
          const key = landed
            ? "landed"
            : `${f.dx.toFixed(2)} ${f.dy.toFixed(2)} ${f.w.toFixed(2)} ${f.h.toFixed(2)}`;
          if (key === card.key) return true;
          if (card.key === "ring" || card.key === "") {
            el.style.opacity = "";
            el.style.pointerEvents = "";
            circle.style.visibility = "hidden";
          }
          card.key = key;

          const { w, h } = card.place;
          if (landed) {
            el.style.transform = "";
            el.style.clipPath = "";
            el.style.willChange = "";
            delete el.dataset.flying;
            if (art) art.style.scale = card.mockup ? String(card.fit) : "";
            if (caption) caption.style.opacity = "";
            return true;
          }
          el.dataset.flying = "";
          el.style.willChange = "transform";
          el.style.transform = `translate(${f.dx.toFixed(2)}px, ${f.dy.toFixed(2)}px)`;
          el.style.clipPath = `inset(${((h - f.h) / 2).toFixed(2)}px ${((w - f.w) / 2).toFixed(2)}px round ${f.radius.toFixed(2)}px)`;
          if (art)
            art.style.scale = (
              card.mockup
                ? mix((MOCKUP_IN_RING[card.mockup] * f.d) / 100, card.fit, f.gw)
                : Math.max(f.w, f.h) / Math.max(w, h)
            ).toFixed(4);
          if (caption) caption.style.opacity = g.toFixed(3);
          return true;
        };

        const stopTurning = onFrame((time, dt) => {
          const scroll = getScroll();
          if (settling > 0 && scroll > 1 && speed.value > 1) {
            gsap.killTweensOf(speed); // the browser restored a position below the top after the intro began
            speed.value = 1;
          }
          s = settling-- > 0 ? scroll : mix(s, scroll, 1 - Math.exp(-dt / MOTION.smoothing));
          if (Math.abs(scroll - s) < 0.5) s = scroll; // or it never quite arrives, and the last row never lands
          const x = Math.max(0, s) / scene.release;
          const windNow = wind(x);
          clock.angle =
            turnRing(clock.angle, {
              dt,
              speed: speed.value,
              wound: clamp01(x) ** 2,
              push: FULL_TURN * MOTION.turns * (windNow - windBefore),
            }) % FULL_TURN;
          windBefore = windNow;

          if (scroll > 1 !== scrolled) {
            scrolled = !scrolled;
            if (scrolled) {
              root.dataset.scrolled = "";
              if (speed.value < 1) setSpeed(1, ACCELERATE, "power2.inOut");
            } else delete root.dataset.scrolled;
          }
          const opacity = clamp01(1 - 1.6 * x).toFixed(3);
          if (fade && opacity !== faded) fade.style.opacity = faded = opacity;

          const scale = mix(1, growth, inOut(clamp01(x), 2));
          const ringX = width / 2;
          const ringY = Math.min(Math.max(scroll, 0), hold) + height / 2; // the hero is sticky until it lets go
          items.forEach((item, i) => {
            const card = cards[i];
            if (card && placeCard(card, i, ringX, ringY, scale)) return;
            const { x: px, y: py, depth } = point(i);
            item.style.transform = `translate(calc(${(px * scale).toFixed(6)} * var(--rx)), calc(${(py * scale).toFixed(6)} * var(--ry))) scale(${depth.toFixed(4)})`;
          });
          report(!scrolled && speed.value < 2 ? nowAtBottom() : -1); // not during the intro
        });

        if (introPlayed) {
          gsap.set(root, { autoAlpha: 1 });
        } else {
          gsap.fromTo(
            root,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1.5,
              ease: "power2.out",
              onComplete: () => {
                introPlayed = true;
              },
            },
          );
          // Only at the top: further down the cards in flight would whirl with the ring.
          if (getScroll() <= 1) {
            speed.value = 30;
            setSpeed(1, 3, "power3.out");
          }
        }

        const abort = new AbortController();
        const { signal } = abort;
        items.forEach((item, i) => {
          const link = item.querySelector("a");
          const label = item.querySelector<HTMLElement>("[data-orbit-label]");
          if (!link || !label) return;

          const stop = () => {
            if (scrolled) return; // only at the top of the page
            label.style.scale = `${1 / point(i).depth}`; // same text size at any depth
            setSpeed(0, BRAKE, "power2.out");
          };
          // Only asks about the other kind of attention: while an event runs, Firefox
          // still reports the link it left as hovered.
          const goUnless = (held: string) => {
            if (!root.querySelector(held))
              setSpeed(1, ACCELERATE, "power2.inOut");
          };

          link.addEventListener(
            "pointerenter",
            (event) => event.pointerType === "mouse" && stop(),
            { signal },
          );
          link.addEventListener(
            "pointerleave",
            () => goUnless("a:focus-visible"),
            { signal },
          );
          link.addEventListener(
            "focus",
            () => link.matches(":focus-visible") && stop(),
            { signal },
          );
          link.addEventListener("blur", () => goUnless("a:hover"), { signal });
        });

        // The browser only scrolls a focused card into view, which can be before it has
        // finished growing. Carry on to where it has, so the panel and the whole card show.
        // Only for the keyboard: a mouse focuses the link on press, and a jump would move the card
        // away from under it.
        cards.forEach((card) => {
          const slot = card.el.closest<HTMLElement>("[data-card-slot]");
          slot?.addEventListener(
            "focus",
            () => {
              if (!slot.matches(":focus-visible")) return;
              const at = finishedAt(card.place, scene);
              if (getScroll() < at) scrollToY(at);
            },
            { signal },
          );
        });

        return () => {
          stopTurning();
          forget();
          abort.abort();
          onBottom(-1);
          delete root.dataset.scrolled;
          fade?.style.removeProperty("opacity");
          items.forEach((item) => item.style.removeProperty("visibility"));
          cards.forEach(({ el, art, caption }) => {
            for (const property of [
              "transform",
              "clip-path",
              "opacity",
              "pointer-events",
              "will-change",
            ])
              el.style.removeProperty(property);
            delete el.dataset.flying;
            art?.style.removeProperty("scale");
            caption?.style.removeProperty("opacity");
          });
        };
      },
    );
  });
}
