"use client";

/** A disc, and a shadow that turns it into a moon. Hovering shows the other theme. */
export function ThemeSwitch() {
  const toggle = () => {
    const root = document.documentElement;
    const system = matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const next = (root.dataset.theme ?? system) === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage is blocked: the theme still changes, but is not remembered.
    }
  };

  return (
    <button
      type="button"
      aria-label="Switch theme"
      onClick={toggle}
      className="group block cursor-pointer rounded-full"
    >
      <svg viewBox="0 0 44 44" className="size-11" aria-hidden>
        <mask id="moon">
          <rect width="44" height="44" fill="white" />
          <circle
            cx="26.1"
            cy="18.5"
            r="7"
            className="translate-x-[8.9px] -translate-y-[7.4px] transition-[translate] duration-1300 ease-[ease-out] group-hover:translate-0 group-hover:duration-650 motion-reduce:transition-none dark:translate-0 dark:group-hover:translate-x-[8.9px] dark:group-hover:-translate-y-[7.4px]"
          />
        </mask>
        <circle cx="22" cy="22" r="8" fill="currentColor" mask="url(#moon)" />
      </svg>
    </button>
  );
}
