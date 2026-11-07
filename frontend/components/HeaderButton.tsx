"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function HeaderButton({
  icon,
  label,
  onClick,
  variant = "ghost",
  title,
  disabled = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "primary" | "secondary" | "outline";
  title?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  function handleClick() {
    // Flash the tooltip briefly on touch devices (no hover)
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    ) {
      setShow(true);
      window.setTimeout(() => setShow(false), 1200);
    }
    onClick();
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
        className={`btn btn-${variant}`}
        style={{
          padding: "10px",
          minWidth: 36,
          justifyContent: "center",
        }}
      >
        <span className="shrink-0 flex items-center justify-center">
          {icon}
        </span>
      </button>

      <AnimatePresence>
        {show && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
            style={{ bottom: "calc(100% + 6px)" }}
          >
            <span
              className="block px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{
                color: "var(--primary)",
                background: "#0d0d0d",
                border: "1px solid var(--frost)",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              }}
            >
              {title ?? label}
            </span>
            <span
              className="block absolute left-1/2 -translate-x-1/2"
              style={{
                top: "100%",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid var(--frost)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
