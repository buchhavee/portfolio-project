import assert from "node:assert/strict";
import { test } from "node:test";
import { bottomIndex, orbitPoint } from "./orbit.ts";

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
