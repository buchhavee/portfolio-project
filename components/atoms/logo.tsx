import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      // 7.41 times as wide as its font size, next to 8rem of buttons, margins and gap
      className="text-h2 max-sm:text-[length:min(2.25rem,(100vw-8rem)/7.41)]"
    >
      mads buchhave.
    </Link>
  );
}
