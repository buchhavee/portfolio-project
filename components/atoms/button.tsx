import Image from "next/image";
import Link from "next/link";
import { FlapText } from "@/components/atoms/flap-text";

/** A link styled like the title card on the project cards. The border keeps it visible on the page background. */
export function Button({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-w-70 items-center justify-between gap-4 rounded-lg border border-border-default bg-bg-surface p-4 text-[1.25rem]/[1.2] font-medium tracking-[-0.01em]"
    >
      <FlapText text={label} />
      <Image
        src="/images/icons/arrow-up-right.svg"
        alt=""
        width={24}
        height={24}
        className="shrink-0 dark:invert"
      />
    </Link>
  );
}
