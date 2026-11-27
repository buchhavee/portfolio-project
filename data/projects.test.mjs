import assert from "node:assert/strict";
import { test } from "node:test";
import { detailRows, metaLine, projects } from "./projects.ts";

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

test("detail rows leave out what is not known", () => {
  const rows = detailRows({ slug: "x", title: "Wash World", type: "School exam, Web dev", year: "2026", color: "#000", mockup: "phone" });
  assert.deepEqual(rows.map((r) => r.label), ["Project", "Type", "Timeframe"]);
  assert.equal(rows[2].value, "2026");
});

test("a period wins over the year, and links show without https", () => {
  const rows = detailRows({ slug: "x", title: "T", type: "School", year: "2026", period: "Spring 2026", role: "UI design + frontend", live: "https://project01.vercel.app/", code: "https://github.com/mads/project01", color: "#000", mockup: "phone" });
  assert.deepEqual(rows.map((r) => [r.label, r.value, r.href]), [
    ["Project", "T", undefined],
    ["Type", "School", undefined],
    ["Timeframe", "Spring 2026", undefined],
    ["Role", "UI design + frontend", undefined],
    ["Live site", "project01.vercel.app", "https://project01.vercel.app/"],
    ["Code", "github.com/mads/project01", "https://github.com/mads/project01"],
  ]);
});

test("every project has an intro and a list of what I did", () => {
  for (const p of projects) assert.ok(p.intro && p.did?.length, p.slug);
});
