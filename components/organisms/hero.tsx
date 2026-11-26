import { HeroSentence } from "@/components/atoms/hero-sentence";
import { Orbit } from "./orbit";

export function Hero() {
  return (
    <div data-hero-track className="hero-track">
      <section
        data-hero
        className="sticky top-0 grid h-svh min-h-140 place-items-center"
      >
        <div data-hero-fade>
          <HeroSentence />
        </div>
        <Orbit />
      </section>
    </div>
  );
}
