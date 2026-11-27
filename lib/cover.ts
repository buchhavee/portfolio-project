import type { Project } from "../data/projects.ts";

/** The feel, in seconds and px, from the prototype (spec 2026-11-27-project-case-design.md). */
export const COVER = {
  grow: 1,
  veilIn: 0.3,
  veilOut: 0.4,
  titleRise: 36,
  titleTime: 1.2,
  giveUp: 2,
} as const;

/** Position, size and corner radius in px. */
export type Box = { x: number; y: number; w: number; h: number; r: number };

export function mixBox(from: Box, to: Box, t: number): Box {
  const mix = (a: number, b: number) => a + (b - a) * t;
  return { x: mix(from.x, to.x), y: mix(from.y, to.y), w: mix(from.w, to.w), h: mix(from.h, to.h), r: mix(from.r, to.r) };
}

/**
 * The picture's box inside the copy, cropped by it with object-fit: cover. Circles and cards show
 * their image in a square (Artwork); the cover shows it in its own box. Never smaller than the copy.
 */
export function pictureSize(from: Box, to: Box, t: number) {
  const side = Math.max(from.w, from.h);
  return { w: side + (to.w - side) * t, h: side + (to.h - side) * t };
}

/** It lands once grown and the cover is there; without the cover it gives up. */
export function phase(elapsed: number, arrived: boolean) {
  if (elapsed < COVER.grow) return "grow";
  if (arrived) return "land";
  return elapsed >= COVER.giveUp ? "giveUp" : "wait";
}

/** round: a circle. sizes: the source's, so the copy shows the picture already loaded. */
export type CoverStart = { project: Project; source: HTMLElement; round: boolean; sizes: string };
export type CoverParts = { cover: HTMLElement; title: HTMLElement };
type Layer = { start(s: CoverStart): boolean; arrive(parts: CoverParts): void };

let layer: Layer | null = null;

export function connectLayer(next: Layer) {
  layer = next;
  return () => {
    if (layer === next) layer = null;
  };
}

/** true when the layer takes over the navigation. */
export function startCover(s: CoverStart) {
  return layer?.start(s) ?? false;
}

export function coverArrived(parts: CoverParts) {
  layer?.arrive(parts);
}
