import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bottomIndex,
  cardFrame,
  clamp01,
  finishedAt,
  keepLanded,
  inOut,
  mix,
  mockupFit,
  orbitPoint,
  progress,
  ringGrowth,
  rowDone,
  sceneOf,
  turnRing,
  wind,
} from "./orbit.ts";

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);

test("nearest at the bottom, furthest at the top, between the two at the sides", () => {
  near(orbitPoint(Math.PI / 2, 0, 9).depth, 1.15);
  near(orbitPoint(-Math.PI / 2, 0, 9).depth, 0.75);
  near(orbitPoint(0, 0, 9).depth, 0.95);
  near(orbitPoint(Math.PI, 0, 9).depth, 0.95);
});

test("the bottom of the ring is down the screen", () => {
  near(orbitPoint(Math.PI / 2, 0, 9).y, 1);
});

test("circles are spread evenly, whatever the count", () => {
  for (const count of [8, 9]) {
    const points = Array.from({ length: count }, (_, i) => orbitPoint(0.7, i, count));
    const gaps = points.map((p, i) => {
      const next = points[(i + 1) % count];
      return Math.hypot(p.x - next.x, p.y - next.y);
    });
    gaps.forEach((gap) => near(gap, gaps[0]));
  }
});

test("a full turn ends where it began, so the loop has no jump", () => {
  const start = orbitPoint(0, 4, 9);
  const end = orbitPoint(Math.PI * 2, 4, 9);
  near(start.x, end.x);
  near(start.y, end.y);
  near(start.depth, end.depth);
});

test("a circle counts as being at the bottom for its arc, one at a time", () => {
  const degrees = (n) => (n * Math.PI) / 180;
  const arc = degrees(18);
  assert.equal(bottomIndex(0, 8, arc), 2); // the third of eight starts at the bottom
  assert.equal(bottomIndex(degrees(8.9), 8, arc), 2);
  assert.equal(bottomIndex(degrees(9.1), 8, arc), -1);
  assert.equal(bottomIndex(degrees(-8.9), 8, arc), 2);
  assert.equal(bottomIndex(degrees(45), 8, arc), 1); // then the one behind it

  const steps = Array.from({ length: 3600 }, (_, i) => bottomIndex(degrees(i / 10), 8, arc));
  assert.equal(new Set(steps.filter((i) => i >= 0)).size, 8);
  const share = steps.filter((i) => i >= 0).length / steps.length;
  assert.ok(Math.abs(share - 18 / 45) < 0.01, `${share}`);
});

// From here: the flight from the ring to the grid, at 1440 × 900 with the spec's numbers.
// Hold 765; row 1's centre at 900 + 765 + 64 + 173 + 16 + 280 = 2198.
const scene = sceneOf({ height: 900, hold: 765, firstRowY: 2198 });
const place = { cx: 484, cy: 2198, w: 920, h: 560, col: 0 };
const circle = { x: 700, y: 1500, d: 115 };

test("the throw starts 50 px after the hold and lands when the place is at 95 % of the screen", () => {
  assert.equal(scene.release, 815);
  near(scene.flight, 2198 - 855 - 815);
  assert.deepEqual(progress(814, place, scene), { p: 0, g: 0 });
  near(progress(2198 - 855, place, scene).p, 1);
});

test("cards further along a row leave 48 px later", () => {
  near(progress(815 + 48, { ...place, col: 1 }, scene).p, 0);
});

test("a card sits on its circle when thrown and fills its place when finished", () => {
  const a = cardFrame(0, 0, place, circle);
  near(a.dx, 216); near(a.dy, -698); near(a.w, 115); near(a.h, 115); near(a.radius, 57.5);
  const b = cardFrame(1, 1, place, circle);
  near(b.dx, 0); near(b.dy, 0); near(b.w, 920); near(b.h, 560); near(b.radius, 28);
});

test("a card grows from 115 % of the screen and is finished when its centre is at 85 %", () => {
  near(progress(2198 - 765, place, scene).g, 1);
  assert.ok(progress(2198 - 766, place, scene).g < 1);
  near(progress(2198 - 1035, place, scene).g, 0);
  near(rowDone(2198, 900), 1433);
});

// A jump would be hundreds of px. Row 4 falls fastest, about 16 px a pixel here, mostly above the screen.
test("nothing jumps: one pixel of scroll moves a card less than 20 px", () => {
  for (const pl of [place, { cx: 1188, cy: 2198, w: 456, h: 560, col: 1 }, { cx: 484, cy: 3926, w: 920, h: 560, col: 0 }]) {
    let last;
    for (let s = 0; s < 4500; s++) {
      const { p, g } = progress(s, pl, scene);
      const f = cardFrame(p, g, pl, circle);
      if (last) for (const k of ["dx", "dy", "w", "h", "radius"]) assert.ok(Math.abs(f[k] - last[k]) < 20, `${k} at ${s}`);
      last = f;
    }
  }
});

test("curves start and end softly", () => {
  for (const n of [2, 3]) {
    assert.ok(inOut(0.001, n) < 1e-4);
    assert.ok(1 - inOut(0.999, n) < 1e-4);
    near(inOut(0.5, n), 0.5);
  }
});

test("the ring winds faster and faster, then keeps its speed", () => {
  near(wind(0.5), 0.25);
  near(wind(1), 1);
  near(wind(1.5), 2);
});

test("60 s a turn at rest, 6× more when wound, and scrolling never adds more than 0.7 turns a second", () => {
  const dt = 1 / 60, base = ((2 * Math.PI) / 60) * dt;
  near(turnRing(0, { dt, speed: 1, wound: 0, push: 0 }), base);
  near(turnRing(0, { dt, speed: 1, wound: 1, push: 0 }), 7 * base);
  assert.ok(turnRing(0, { dt, speed: 0, wound: 0, push: 10 }) <= 2 * Math.PI * 0.7 * dt + 1e-9);
});

test("the ring grows 1.2× only where the screen has room, and not on phones", () => {
  near(ringGrowth({ width: 1440, height: 900, rx: 400, ry: 330, size: 100 }), (450 - 57.5) / 330);
  near(ringGrowth({ width: 1920, height: 1080, rx: 534, ry: 396, size: 100 }), 1.2);
  assert.equal(ringGrowth({ width: 390, height: 844, rx: 175.5, ry: 175.5, size: 72 }), 1);
});

test("mockups fit their card like in Figma", () => {
  near(mockupFit("browser", 920, 560), 1);
  near(mockupFit("browser", 358, 280), (0.7 * 358) / 520);
  near(mockupFit("phone", 456, 560), 1);
  near(mockupFit("phone", 358, 358), (0.72 * 358) / 370);
});

test("mix and clamp01 do what they say", () => {
  near(mix(10, 20, 0.25), 12.5);
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  near(clamp01(0.3), 0.3);
});

test("a card near the end of the page still finishes, just earlier", () => {
  // The page ends at 3100, but row 4 would only be finished at 3926 − 765 = 3161.
  const short = sceneOf({ height: 900, hold: 765, firstRowY: 2198, end: 3100 });
  const last = { cx: 484, cy: 3926, w: 920, h: 560, col: 0 };
  assert.deepEqual(progress(3100, last, short), { p: 1, g: 1 });
  assert.ok(progress(3099, last, short).g < 1);
  assert.deepEqual(progress(1700, place, short), progress(1700, place, scene)); // row 1 is untouched
});

test("at the very end of the page, the last card is exactly finished, despite rounding", () => {
  const odd = sceneOf({ height: 972, hold: 826.2, firstRowY: 2198, end: 3793.14 });
  assert.equal(progress(3793.14, { cx: 0, cy: 4757.446, w: 920, h: 560, col: 0 }, odd).g, 1);
});

test("a card is finished where finishedAt says, also at the end of the page", () => {
  assert.equal(finishedAt(place, scene), rowDone(2198, 900));
  assert.deepEqual(progress(finishedAt(place, scene), place, scene), { p: 1, g: 1 });
  const short = sceneOf({ height: 900, hold: 765, firstRowY: 2198, end: 3100 });
  const last = { cx: 484, cy: 3926, w: 920, h: 560, col: 0 };
  assert.equal(finishedAt(last, short), 3100);
  assert.ok(progress(finishedAt(last, short) - 1, last, short).g < 1);
});

test("rows 1 and 2 are finished when row 1's top is 25 px from the top, on the user's 1702 × 1108 screen", () => {
  // Row 1's centre at 1108 + 942 + 64 + 173 + 16 + 280 = 2583, row 2's 576 below it.
  const tall = sceneOf({ height: 1108, hold: 942, firstRowY: 2583 });
  const there = 2583 - 280 - 25;
  for (const col of [0, 1, 2]) {
    const row2 = { cx: 0, cy: 2583 + 576, w: 548, h: 560, col };
    assert.deepEqual(progress(there, row2, tall), { p: 1, g: 1 });
    assert.ok(finishedAt(row2, tall) < there);
  }
  assert.deepEqual(progress(there, { cx: 0, cy: 2583, w: 1100, h: 560, col: 1 }, tall), { p: 1, g: 1 });
});

test("a landed card is kept until its place is below the screen and it is back at the ring", () => {
  assert.equal(keepLanded(false, 0.5, 0, 500, 1000), false); // never landed: flies as before
  assert.equal(keepLanded(false, 1, 1, 500, 1000), true); // lands
  assert.equal(keepLanded(false, 1, 0.5, 500, 1000), false); // still growing: not landed yet
  assert.equal(keepLanded(true, 0.5, 0, 999, 1000), true); // scrolled back up, place still on screen
  assert.equal(keepLanded(true, 0.3, 0, 1000, 1000), true); // place below the screen, but mid-flight it would show by the ring
  assert.equal(keepLanded(true, 0, 0, 1000, 1000), false); // below the screen and back at the ring: let go
});
