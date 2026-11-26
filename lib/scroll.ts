import Lenis from "lenis";
import { onFrame } from "./frame.ts";
import { RESPECT_REDUCED_MOTION, STILL } from "./motion.ts";

export const LERP = 0.2;
export const BRAKE_CAP = 1500; // px per second, for mouse and trackpad between the hero and the first row

/**
 * Scrolling earns a budget of pixels per second and spends it. A step within 80 % of what is
 * left passes unchanged, so ordinary wheel steps are not shortened; beyond that it bends softly
 * towards the budget, so a fast push is capped.
 */
export function createBrake(cap: number) {
  let budget = cap * 0.1;
  let last = -Infinity;
  return (deltaY: number, now: number) => {
    budget = Math.min(cap * 0.1, budget + (cap * (now - last)) / 1000);
    last = now;
    const knee = budget * 0.8;
    const size = Math.abs(deltaY);
    const out =
      size <= knee
        ? size
        : knee + (budget - knee) * Math.tanh((size - knee) / Math.max(budget - knee, 1e-6));
    budget -= out;
    return Math.sign(deltaY) * out;
  };
}

let lenis: Lenis | null = null;
let brakeEnd = 0;
const brake = createBrake(BRAKE_CAP);

/** The brake works above this scroll position. 0 turns it off. */
export function setBrakeEnd(scrollY: number) {
  brakeEnd = scrollY;
}

/** Starts the one Lenis, driven by the shared frame loop. */
export function startLenis() {
  if (lenis) return () => {};

  const instance = new Lenis({
    lerp: LERP,
    autoRaf: false,
    respectReducedMotion: RESPECT_REDUCED_MOTION,
    stopInertiaOnNavigate: true, // a link clicked mid-glide wins over the glide
    virtualScroll: (data) => {
      if (
        data.event.type.includes("wheel") &&
        brakeEnd > 0 &&
        instance.scroll < brakeEnd &&
        !matchMedia(STILL).matches
      )
        data.deltaY = brake(data.deltaY, performance.now());
      return true;
    },
  });
  lenis = instance;
  const stop = onFrame((time) => instance.raf(time), -1);

  // Lenis stops its glide only for links to other pages. A link to an anchor on this page,
  // like the menu's #projects, must stop it too, or the glide carries the page past the anchor.
  const stopForAnchor = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
    if (!link) return;
    const url = new URL(link.href);
    if (url.hash && url.pathname === location.pathname)
      instance.scrollTo(instance.scroll, { immediate: true, force: true });
  };
  addEventListener("click", stopForAnchor, true);

  return () => {
    removeEventListener("click", stopForAnchor, true);
    stop();
    instance.destroy();
    lenis = null;
  };
}

export function getScroll() {
  return lenis?.scroll ?? window.scrollY;
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
