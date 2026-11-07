"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function ShowMore({
  children,
  collapsedHeight = 220,
  labelMore = "show more",
  labelLess = "show less",
}: {
  children: React.ReactNode;
  collapsedHeight?: number;
  labelMore?: string;
  labelLess?: string;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > collapsedHeight + 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, collapsedHeight]);

  return (
    <div>
      <div
        ref={innerRef}
        className="relative overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{
          maxHeight: open ? 4000 : overflowing ? collapsedHeight : "none",
        }}
      >
        {children}

        {!open && overflowing && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--void))",
            }}
          />
        )}
      </div>

      {overflowing && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-(--secondary) hover:text-(--primary) transition-colors duration-200"
        >
          <ChevronDown
            size={11}
            className={
              "transition-transform duration-200" + (open ? " rotate-180" : "")
            }
          />
          {open ? labelLess : labelMore}
        </button>
      )}
    </div>
  );
}
