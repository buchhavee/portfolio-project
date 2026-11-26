import assert from "node:assert/strict";
import { test } from "node:test";

// A screen that only draws a frame when the test says so.
let pending = new Map();
let next = 0;
globalThis.requestAnimationFrame = (callback) => {
  pending.set(++next, callback);
  return next;
};
globalThis.cancelAnimationFrame = (id) => pending.delete(id);
const tick = (time) => {
  const now = pending;
  pending = new Map();
  now.forEach((callback) => callback(time));
};

const { onFrame } = await import("./frame.ts");

test("callbacks run once a frame, lowest order first, with dt in seconds", () => {
  const calls = [];
  const offA = onFrame((t, dt) => calls.push(["a", dt]));
  const offB = onFrame((t, dt) => calls.push(["b", dt]), -1);
  tick(1000);
  tick(1016.7);
  assert.deepEqual(
    calls.map((c) => c[0]),
    ["b", "a", "b", "a"],
  );
  assert.ok(Math.abs(calls[3][1] - 0.0167) < 1e-6);
  offA();
  offB();
});

test("a long pause counts as at most 0.05 s", () => {
  const dts = [];
  const off = onFrame((t, dt) => dts.push(dt));
  tick(1000);
  tick(3000);
  assert.equal(dts.at(-1), 0.05);
  off();
});

test("the loop stops when nobody listens, and unsubscribing twice is harmless", () => {
  const off = onFrame(() => {});
  tick(1000);
  off();
  off();
  tick(1016.7); // the frame already asked for
  assert.equal(pending.size, 0);
});
