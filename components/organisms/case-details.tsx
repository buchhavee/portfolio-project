import { Tag } from "@/components/atoms/tag";
import { detailRows, type Project } from "@/data/projects";

const label = "text-body-sm text-text-secondary";

/** Introduction and Details on a case page (Figma 17:652, mobile 17:853 and 17:856). */
export function CaseDetails({ project }: { project: Project }) {
  return (
    <section className="flex flex-col gap-12 px-4 pt-12 pb-16 md:px-6 lg:flex-row lg:gap-16 lg:pt-32 lg:pb-40 xl:gap-32 xl:px-28">
      <div className="flex flex-col gap-4 md:gap-8 lg:max-w-155 lg:flex-1">
        <h2 className={label}>Introduction</h2>
        <p className="text-h3 md:text-h2">{project.intro}</p>
      </div>
      <div className="flex flex-col gap-4 md:gap-8 lg:w-117 lg:shrink-0">
        <h2 className={label}>Details</h2>
        <dl className="text-body-sm">
          {detailRows(project).map((row) => (
            <div key={row.label} className="flex justify-between gap-4 border-b border-border-default py-3">
              <dt className="text-text-secondary">{row.label}</dt>
              <dd className="text-right">
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noreferrer" className="text-accent-default">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        {project.tech && (
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <li key={tech}>
                <Tag label={tech} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
