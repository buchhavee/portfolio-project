import assert from "node:assert/strict";
import { test } from "node:test";
import { clips, covered, flipAt, moves, sequence } from "./flap.ts";

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);

test("only letters and digits move", () => {
  for (const ch of "buchhavee@gmail.com+45 24 26 43 48'.")
    assert.equal(moves(ch), /[a-z0-9]/.test(ch), ch);
  assert.equal(moves("æ"), true);
});

test("characters that stand still keep one entry", () => {
  for (const ch of [".", "'", " ", "@", "+"]) assert.deepEqual(sequence(ch, 3), [ch]);
});

test("a sequence starts and ends on its own character, from its own group", () => {
  assert.deepEqual(sequence("d", 3, () => 0), ["d", "a", "a", "a", "d"]);
  assert.deepEqual(sequence("P", 3, () => 0), ["P", "A", "A", "A", "P"]);
  assert.deepEqual(sequence("4", 3, () => 0.99), ["4", "9", "9", "9", "4"]);
  assert.deepEqual(sequence("æ", 3, () => 0), ["æ", "a", "a", "a", "æ"]);
  for (const ch of "+45 24 26 43 48".replace(/\D/g, ""))
    assert.ok(sequence(ch, 3).every((c) => /\d/.test(c)), ch);
});

test("flipAt splits a turn into a step and an angle", () => {
  assert.deepEqual(flipAt(0, 4), { step: 0, angle: 0 });
  assert.deepEqual(flipAt(2.25, 4), { step: 2, angle: 45 });
  assert.deepEqual(flipAt(4, 4), { step: 3, angle: 180 });
});

test("covered follows the flap in perspective", () => {
  assert.equal(covered(0, 0.5, 7.5), 1);
  near(covered(90, 0.5, 7.5), 0);
  const c = covered(60, 0.5, 7.5);
  assert.ok(c > 0.5 && c < 1, `${c}`); // perspective makes it larger than cos 60°
  assert.equal(covered(80, 2, 1), 1); // the edge has passed the viewer
});

test("clips uncover the new top and cover the old bottom", () => {
  assert.deepEqual(clips(0, 1.1), { top: "inset(0 -1em 100% -1em)", bottom: "" });
  assert.deepEqual(clips(90, 1.1), { top: "", bottom: "inset(58% -1em -0.5em -1em)" });
  const top = parseFloat(clips(45, 1.1).top.split(" ")[2]);
  assert.ok(top > 42 && top < 100, `${top}`);
});

test("once covered, the old letter is hidden completely, tail and all", () => {
  assert.equal(clips(179, 1.1).bottom, "inset(100% 0 0 0)");
});
