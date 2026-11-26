// Split-flap letters (spec: 2026-11-26-split-flap-design.md). Durations in seconds, perspective in em.
export const FLAP = {
  flips: 3,
  duration: 0.7,
  stagger: 0.075,
  ease: "power2.out",
  perspective: 7.5,
  split: 0.58,
} as const;

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = LOWER.toUpperCase();
const DIGITS = "0123456789";

/** Only letters and digits flip. ".", "'", "@", "+" and spaces stand still. */
export function moves(char: string) {
  return /[\p{L}\p{N}]/u.test(char);
}

/** What a cell shows: its own character, `count` random ones from its group, then its own again. */
export function sequence(char: string, count: number, random = Math.random) {
  if (!moves(char)) return [char];
  const group = /\d/.test(char) ? DIGITS : char !== char.toLowerCase() ? UPPER : LOWER;
  const between = Array.from({ length: count }, () => group[Math.floor(random() * group.length)]);
  return [char, ...between, char];
}

/** Which flip a turn is on, and how far it has fallen in degrees. */
export function flipAt(turn: number, steps: number) {
  const step = Math.min(Math.floor(turn), steps - 1);
  return { step, angle: 180 * (turn - step) };
}

/** How much of a half (`half` em tall) a flap hides at `degrees` from flat, seen in perspective. */
export function covered(degrees: number, half: number, perspective: number) {
  const r = (degrees * Math.PI) / 180;
  const d = perspective - half * Math.sin(r);
  return d <= 0 ? 1 : Math.min(1, (Math.cos(r) * perspective) / d);
}

const pct = (share: number) => +(share * 100).toFixed(2);

/** Clip-paths for the still top and bottom while a cell flips. "" leaves the one in CSS. */
export function clips(angle: number, lineHeight: number) {
  const sp = FLAP.split;
  if (angle < 90) {
    const c = covered(angle, sp * lineHeight, FLAP.perspective);
    return { top: `inset(0 -1em ${pct(1 - sp + sp * c)}% -1em)`, bottom: "" };
  }
  const c = covered(180 - angle, (1 - sp) * lineHeight, FLAP.perspective);
  // A tail like g's hangs below the cell, so once the cell is covered the old letter goes completely.
  return { top: "", bottom: c < 1 ? `inset(${pct(sp + (1 - sp) * c)}% -1em -0.5em -1em)` : "inset(100% 0 0 0)" };
}
