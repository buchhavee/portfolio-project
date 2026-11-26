// Reduced motion is ignored for now, at the user's request (26 November 2026).
// To respect it again: set this to true, and undo the CSS marked "reduced motion" in app/globals.css.
export const RESPECT_REDUCED_MOTION = false;

/** Media queries for gsap.matchMedia and matchMedia. "not all" never matches, "all" always does. */
export const STILL = RESPECT_REDUCED_MOTION ? "(prefers-reduced-motion: reduce)" : "not all";
export const MOVING = RESPECT_REDUCED_MOTION ? "(prefers-reduced-motion: no-preference)" : "all";
