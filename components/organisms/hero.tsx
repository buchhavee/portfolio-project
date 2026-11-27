import { HeroSentence } from "@/components/atoms/hero-sentence";
import { Orbit } from "./orbit";

export function Hero() {
  return (
    <div data-hero-track className="hero-track">
      {/* Safari 26 paints its bars in the colour of a full-width pinned box at the edge.
          A hidden box is skipped, and its children still show. */}
      <section
        data-hero
        className="pointer-events-none invisible sticky top-0 grid h-svh min-h-140 place-items-center *:visible"
      >
        <div data-hero-fade className="pointer-events-auto">
          <HeroSentence />
        </div>
        <Orbit />
      </section>
    </div>
  );
}
