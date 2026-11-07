"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({
  text,
  label = "Copy",
  iconOnly = false,
  icon,
}: {
  text: string;
  label?: string;
  /** When true, only the icon is shown — the label becomes a tooltip on hover. */
  iconOnly?: boolean;
  /** Optional custom icon; defaults to Copy/Check. */
  icon?: React.ReactNode;
}) {
  const [done, setDone] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const button = (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || "Copy"}
      className={
        "inline-flex items-center justify-center gap-1.5 h-9 text-[13px] font-medium " +
        "text-(--ao-text-primary) transition-colors duration-150 shrink-0 " +
        "hover:bg-white/[0.05] " +
        (iconOnly ? "w-9" : "px-3.5")
      }
      style={{ borderRadius: 9999 }}
    >
      {done ? <Check size={14} /> : <Copy size={14} />}
      {!iconOnly && <span>{done ? "Copied" : label}</span>}
    </button>
  );

  if (!iconOnly) return button;

  return (
    <div className="relative group inline-block">
      {button}
      <span
        className="
          pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2
          px-2.5 py-1.5 rounded-md text-[11.5px] font-medium whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          z-50
        "
        style={{
          background: "var(--ao-bg-subtle)",
          color: "var(--ao-text-primary)",
          border: "1px solid var(--frost)",
        }}
      >
        {done ? "Copied!" : label}
      </span>
    </div>
  );
}
