"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "./CopyButton";

export function DiffViewer({ diff }: { diff: string }) {
  const [wrap, setWrap] = useState(false);

  const lines = useMemo(() => diff.split("\n"), [diff]);

  const stats = useMemo(() => {
    let adds = 0;
    let removes = 0;
    let files = 0;
    for (const l of lines) {
      if (l.startsWith("+++ ") || l.startsWith("--- ")) files++;
      else if (l.startsWith("+")) adds++;
      else if (l.startsWith("-")) removes++;
    }
    return { adds, removes, files: Math.floor(files / 2) };
  }, [lines]);

  if (!diff.trim()) {
    return (
      <p className="font-mono text-[10px] text-(--secondary)">
        — no textual changes —
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span style={{ color: "var(--a-green)" }}>+{stats.adds}</span>
          <span style={{ color: "var(--ao-red)" }}>−{stats.removes}</span>
          <span className="text-(--secondary)">
            {stats.files} file{stats.files === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWrap((v) => !v)}
            className="font-mono text-[10px] px-2 h-6 text-(--secondary) hover:text-(--primary) transition-colors duration-150"
            style={{ borderRadius: 4, border: "1px solid var(--frost)" }}
          >
            {wrap ? "no-wrap" : "wrap"}
          </button>
          <CopyButton text={diff} label="" />
        </div>
      </div>

      <pre
        dir="ltr"
        className="overflow-auto px-3 py-3 font-mono text-[11px] leading-[1.7]"
        style={{
          background: "var(--ao-bg-surface)",
          border: "1px solid var(--frost)",
          borderRadius: 8,
          whiteSpace: wrap ? "pre-wrap" : "pre",
          wordBreak: wrap ? "break-word" : "normal",
          maxHeight: 640,
        }}
      >
        <code>
          {lines.map((line, i) => {
            let color = "var(--secondary)";
            let bg: string | undefined;

            if (line.startsWith("+++ ") || line.startsWith("--- ")) {
              color = "var(--a-blue)";
              bg = "rgba(59,158,255,0.06)";
            } else if (line.startsWith("@@")) {
              color = "var(--a-blue)";
              bg = "rgba(59,158,255,0.04)";
            } else if (line.startsWith("+")) {
              color = "var(--a-green)";
              bg = "rgba(17,255,153,0.06)";
            } else if (line.startsWith("-")) {
              color = "var(--ao-red)";
              bg = "rgba(255,26,26,0.06)";
            } else if (line.startsWith("diff ")) {
              color = "var(--a-yellow)";
              bg = "rgba(255,197,61,0.06)";
            }

            return (
              <span
                key={i}
                style={{ color, background: bg, display: "block" }}
              >
                {line || "\u00A0"}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
