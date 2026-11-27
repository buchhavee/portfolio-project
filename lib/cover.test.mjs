import assert from "node:assert/strict";
import { test } from "node:test";
import { connectLayer, coverArrived, mixBox, phase, pictureSize, startCover } from "./cover.ts";

const circle = { x: 100, y: 200, w: 122, h: 122, r: 61 };
const cover = { x: 24, y: 96, w: 1392, h: 560, r: 28 };

test("the copy starts on its source and ends on the cover", () => {
  assert.deepEqual(mixBox(circle, cover, 0), circle);
  assert.deepEqual(mixBox(circle, cover, 1), cover);
  assert.deepEqual(mixBox(circle, cover, 0.5), { x: 62, y: 148, w: 757, h: 341, r: 44.5 });
});

test("it lands when grown and the cover is there, and gives up after 2 s", () => {
  assert.equal(phase(0.5, true), "grow");
  assert.equal(phase(1, true), "land");
  assert.equal(phase(1.2, false), "wait");
  assert.equal(phase(2, false), "giveUp");
});

test("without a layer the link is a plain link", () => {
  assert.equal(startCover({ project: {}, source: {}, round: false, sizes: "" }), false);
});

test("a connected layer decides, and hears the cover arrive", () => {
  const heard = [];
  const off = connectLayer({ start: () => true, arrive: (parts) => heard.push(parts) });
  assert.equal(startCover({ project: {}, source: {}, round: true, sizes: "" }), true);
  coverArrived({ cover: 1, title: 2 });
  assert.deepEqual(heard, [{ cover: 1, title: 2 }]);
  off();
  assert.equal(startCover({ project: {}, source: {}, round: true, sizes: "" }), false);
});

test("the picture goes from the source's square crop to the cover's own, and always covers the copy", () => {
  const card = { x: 0, y: 0, w: 920, h: 560, r: 28 };
  assert.deepEqual(pictureSize(card, cover, 0), { w: 920, h: 920 });
  assert.deepEqual(pictureSize(card, cover, 1), { w: 1392, h: 560 });
  for (let t = 0; t <= 1; t += 0.1) {
    const box = mixBox(card, cover, t), pic = pictureSize(card, cover, t);
    assert.ok(pic.w >= box.w - 1e-9 && pic.h >= box.h - 1e-9, `gap at t=${t}`);
  }
});
