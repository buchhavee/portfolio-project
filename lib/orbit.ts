// The bottom of the ring is nearest, the top is furthest away.
const FRONT = 1.15;
const BACK = 0.75;
const MIDDLE = (FRONT + BACK) / 2;
const SWING = (FRONT - BACK) / 2;

export const FULL_TURN = Math.PI * 2;

/** Where a circle is on the ring: x and y run from -1 to 1, depth is its scale. */
export function orbitPoint(angle: number, index: number, count: number) {
  const a = angle + (index / count) * FULL_TURN;
  const y = Math.sin(a);
  return { x: Math.cos(a), y, depth: MIDDLE + SWING * y };
}

/** The circle that is passing the bottom, within an arc, or -1. */
export function bottomIndex(angle: number, count: number, arc: number) {
  for (let i = 0; i < count; i++)
    if (orbitPoint(angle, i, count).y > Math.cos(arc / 2)) return i;
  return -1;
}

// The same point written in CSS (--a is set in globals.css), so the ring is right
// on the server, without JavaScript and with reduced motion.
const restingDepth = `(${MIDDLE} + ${SWING} * sin(var(--a)))`;
export const restingTransform = `translate(calc(cos(var(--a)) * var(--rx)), calc(sin(var(--a)) * var(--ry))) scale(calc${restingDepth})`;
export const restingLabelScale = `calc(1 / ${restingDepth})`;

// ---------- From the ring to the grid (spec: 2026-11-25-orbit-to-grid-design.md) ----------

/** The numbers the user chose in the prototype. Heights are shares of the hero's height. */
export const MOTION = {
  turns: 1.25, // turns that scrolling the hold gives the ring
  boost: 6, // extra speed once wound up
  maxTurns: 0.7, // a turn a second at most from scrolling, so nine circles never flicker
  growth: 1.2, // the ring at full speed, where the screen has room
  launch: 50, // px after the hero lets go
  gap: 48, // px between cards in a row
  power: 3,
  gravity: 0.5,
  land: 0.8, // a circle lands when its place is at 80 % of the screen
  landSize: 200,
  growFrom: 1,
  growTo: 0.7, // finished with its centre at 70 % of the screen, low enough that the panel comes early. Must stay under land.
  lead: 0.14, // the width leads the height
  smoothing: 0.3, // s
  corner: 28,
} as const;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
// Within a millionth of the ends counts as there: rounding must not leave a card a hair short of landed.
export const clamp01 = (t: number) =>
  t <= 1e-6 ? 0 : t >= 1 - 1e-6 ? 1 : t;

/** Slow in, slow out. */
export const inOut = (t: number, power: number) =>
  t < 0.5 ? 0.5 * (2 * t) ** power : 1 - 0.5 * (2 * (1 - t)) ** power;

/** Faster and faster during the hold, then steady. */
export const wind = (x: number) => (x < 1 ? x * x : 1 + 2 * (x - 1));

export function turnRing(
  angle: number,
  o: { dt: number; speed: number; wound: number; push: number },
) {
  const limit = FULL_TURN * MOTION.maxTurns * o.dt;
  const drift = o.dt * (FULL_TURN / 60) * o.speed * (1 + MOTION.boost * o.wound);
  return angle + drift + (limit ? limit * Math.tanh(o.push / limit) : 0); // a soft ceiling
}

/** How much the ring may grow: never past the screen's edge, and not at all on phones. */
export function ringGrowth(o: { width: number; height: number; rx: number; ry: number; size: number }) {
  if (o.width < 640) return 1;
  return Math.min(
    MOTION.growth,
    (o.height / 2 - (o.size * FRONT) / 2) / o.ry,
    (o.width / 2 - (o.size * MIDDLE) / 2) / o.rx,
  );
}

export type Scene = { height: number; release: number; flight: number; end: number };
export type Place = { cx: number; cy: number; w: number; h: number; col: number };

/** firstRowY is the centre of the first row's cards, on the page. end is the furthest the page scrolls. */
export function sceneOf(o: { height: number; hold: number; firstRowY: number; end?: number }): Scene {
  const release = o.hold + MOTION.launch;
  return {
    height: o.height,
    release,
    flight: Math.max(200, o.firstRowY - MOTION.land * o.height - release),
    end: o.end ?? Infinity,
  };
}

/** p: from the ring (0) to the place (1). g: from circle (0) to card (1). */
export function progress(s: number, place: Place, scene: Scene) {
  // A card the page cannot scroll far enough for does it all earlier, so it still finishes.
  const late = Math.max(0, place.cy - MOTION.growTo * scene.height - scene.end);
  const start = place.cy - MOTION.land * scene.height - scene.flight + place.col * MOTION.gap - late;
  const from = place.cy - MOTION.growFrom * scene.height - late;
  return {
    p: clamp01((s - start) / scene.flight),
    g: clamp01((s - from) / ((MOTION.growFrom - MOTION.growTo) * scene.height)),
  };
}

/** Where a card is and how much of it shows. circle is its place on the ring: page position and diameter. */
export function cardFrame(
  p: number,
  g: number,
  place: Place,
  circle: { x: number; y: number; d: number },
) {
  const ex = inOut(p, MOTION.power);
  const ey = inOut(p ** (1 + MOTION.gravity), MOTION.power); // falls later than it drifts sideways
  const d = mix(circle.d, Math.min(MOTION.landSize, place.w, place.h), ex);
  const gw = inOut(clamp01(g / (1 - MOTION.lead)), 2);
  const gh = inOut(clamp01((g - MOTION.lead) / (1 - MOTION.lead)), 2);
  const w = mix(d, place.w, gw);
  const h = mix(d, place.h, gh);
  return {
    dx: (circle.x - place.cx) * (1 - ex),
    dy: (circle.y - place.cy) * (1 - ey),
    d,
    w,
    h,
    radius: mix(Math.min(w, h) / 2, MOTION.corner, gh),
    gw,
  };
}

/** A mockup's size in a card, as in Figma: it fills about 70 % of the card. */
export function mockupFit(mockup: "browser" | "phone", w: number, h: number) {
  return mockup === "browser"
    ? Math.min(1, (0.7 * w) / 520, (0.7 * h) / 340)
    : Math.min(1, (0.72 * h) / 370, (0.8 * w) / 180);
}

/** The scroll position where the first row has finished growing. */
export const rowDone = (firstRowY: number, height: number) =>
  firstRowY - MOTION.growTo * height;

/** The scroll position where a card has landed and finished growing. */
export const finishedAt = (place: Place, scene: Scene) =>
  Math.min(place.cy - MOTION.growTo * scene.height, scene.end);
