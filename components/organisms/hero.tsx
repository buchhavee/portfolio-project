import { HeroSentence } from "@/components/atoms/hero-sentence";
import { Orbit } from "./orbit";

export function Hero() {
  return (
    <section className="relative grid h-svh min-h-140 place-items-center overflow-clip">
      <HeroSentence />
      <Orbit />
    </section>
  );
}
