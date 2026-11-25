import { Logo } from "@/components/atoms/logo";
import { Menu } from "./menu";

export function Header() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-4 pt-3.5 *:pointer-events-auto sm:px-8 sm:pt-6">
      <div className="pt-1">
        <Logo />
      </div>
      <Menu />
    </header>
  );
}
