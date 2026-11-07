"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Thin vertical drag handle between two panes.
 * - reports delta since the previous mouse move via `onDrag`
 * - `onDragStart` / `onDragEnd` let the parent track the "active" handle
 */
export function ResizeHandle({
  onDrag,
  onDragStart,
  onDragEnd,
  active,
}: {
  onDrag: (deltaX: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  active?: boolean;
}) {
  const lastX = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      lastX.current = e.clientX;
      onDragStart?.();
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: MouseEvent) => {
        onDrag(ev.clientX - lastX.current);
        lastX.current = ev.clientX;
      };
      const onUp = () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        onDragEnd?.();
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onDrag, onDragStart, onDragEnd],
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onMouseDown={onMouseDown}
      className="relative shrink-0 w-1 cursor-col-resize select-none self-stretch"
      style={{
        background: active ? "var(--tertiary)" : "transparent",
        transition: "background-color 120ms",
      }}
    >
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px"
        style={{
          background: active ? "var(--tertiary)" : "var(--frost)",
          transition: "background-color 120ms",
        }}
      />
    </div>
  );
}
