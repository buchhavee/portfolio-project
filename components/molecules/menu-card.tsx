import Link from "next/link";
import { elsewhereLinks, mainLinks } from "@/data/site";

type Props = {
  onNavigate: () => void;
};

export function MenuCard({ onNavigate }: Props) {
  return (
    <div className="px-6 pt-23 pb-6">
      <ul className="dim-siblings flex flex-col gap-1 text-menu">
        {mainLinks.map(({ label, href }) => (
          <li key={label} data-unfold-item>
            <Link
              href={href}
              prefetch={false} // the pages do not exist yet
              onClick={onNavigate}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <hr data-unfold-item className="my-6 border-border-inverse" />
      <p
        data-unfold-item
        className="mb-2 text-caps text-text-inverse-secondary uppercase"
      >
        Elsewhere
      </p>
      <ul className="dim-siblings flex flex-col gap-2 text-body">
        {elsewhereLinks.map(({ label, href }) => (
          <li key={label} data-unfold-item>
            <a href={href} target="_blank" rel="noopener" onClick={onNavigate}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
