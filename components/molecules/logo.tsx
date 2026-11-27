import Link from "next/link";
import { FlapText } from "@/components/atoms/flap-text";

export function Logo() {
  return (
    <Link
      href="/"
      data-ink
      // 7.48 times as wide as its font size (split into flap cells, so without kerning), next to 8rem of buttons, margins and gap
      className="ink-split text-h2 max-sm:text-[length:min(2.25rem,(100vw-8rem)/7.48)]"
    >
      <FlapText text="mads buchhave." />
    </Link>
  );
}
