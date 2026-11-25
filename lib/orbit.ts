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
