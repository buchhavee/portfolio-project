import assert from "node:assert/strict";
import { test } from "node:test";
import { createBrake } from "./scroll.ts";

test("slow scrolling passes through almost untouched", () => {
  const brake = createBrake(1500);
  for (let k = 1; k <= 20; k++)
    assert.ok(Math.abs(brake(20, k * 50) - 20) < 0.5);
});

test("fast scrolling is capped near 1500 px a second", () => {
  const brake = createBrake(1500);
  let sum = 0;
  for (let k = 1; k <= 120; k++) sum += brake(140, (k * 1000) / 120);
  assert.ok(sum <= 1500 + 150 + 1 && sum > 1200, String(sum));
});

test("it brakes upwards too", () => {
  const brake = createBrake(1500);
  let sum = 0;
  for (let k = 1; k <= 120; k++) sum += brake(-140, (k * 1000) / 120);
  assert.ok(sum >= -1651 && sum < -1200, String(sum));
});

test("ordinary wheel steps up to 120 px pass unchanged", () => {
  for (const step of [40, 100, 120]) {
    const brake = createBrake(1500);
    assert.equal(brake(step, 1000), step);
    assert.equal(createBrake(1500)(-step, 1000), -step);
  }
});

test("a step larger than what is left is softly capped, never above it", () => {
  const brake = createBrake(1500);
  const out = brake(300, 1000);
  assert.ok(out > 120 && out <= 150, String(out));
});
