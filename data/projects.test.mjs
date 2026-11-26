import assert from "node:assert/strict";
import { test } from "node:test";
import { metaLine, projects } from "./projects.ts";

test("nine projects, one per circle and card", () => {
  assert.equal(projects.length, 9);
  assert.equal(new Set(projects.map((p) => p.slug)).size, 9);
});

test("each project has an image or a mockup, never both", () => {
  for (const p of projects) assert.ok(Boolean(p.image) !== Boolean(p.mockup), p.slug);
});

test("the meta line joins what is known", () => {
  assert.equal(metaLine({ type: "School", year: "2026", tech: ["React", "TypeScript"] }), "School · 2026 · React, TypeScript");
  assert.equal(metaLine({ type: "Website redesign" }), "Website redesign");
});
