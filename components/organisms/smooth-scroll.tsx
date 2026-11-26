"use client";

import { useEffect } from "react";
import { startLenis } from "@/lib/scroll";

/** Smooth wheel scrolling for the whole site. */
export function SmoothScroll() {
  useEffect(startLenis, []);
  return null;
}
