/** "What I did" on a case page, numbered (Figma 17:683, mobile 17:878). */
export function CaseScope({ items }: { items: string[] }) {
  return (
    <section className="flex flex-col gap-4 px-4 pb-16 md:gap-8 md:px-6 lg:pb-40 xl:px-28">
      <h2 className="text-body-sm text-text-secondary">What I did</h2>
      <ol>
        {items.map((item, i) => (
          <li
            key={item}
            className="flex justify-between gap-4 border-b border-border-default py-3.5 text-body-l font-medium md:py-5 md:text-h3"
          >
            {item}
            <span className="text-text-secondary">{String(i + 1).padStart(2, "0")}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
