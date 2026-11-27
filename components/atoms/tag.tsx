/** A technology tag (Figma Tag, 6:32). */
export function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border-default/46 bg-bg-surface px-3 py-1 text-body-sm">
      {label}
    </span>
  );
}
