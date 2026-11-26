"use client";

import { useEffect, useState } from "react";
import { FlapText } from "@/components/atoms/flap-text";

/** Copies the text and says "Copied" for two seconds. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const label = copied ? "Copied" : "Copy";

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      // The clipboard is missing outside https and localhost. The address next to it is still a link.
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
      className="cursor-pointer rounded-full border border-border-inverse px-4 py-2 text-body-sm"
    >
      <span aria-live="polite">
        {/* A new key starts the letters afresh, so a flip in progress does not land on the old word. */}
        <FlapText key={label} text={label} />
      </span>
    </button>
  );
}
