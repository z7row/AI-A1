"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { ParsedFile, ParsedPatch } from "@/lib/types";

export function FileBlock({ file }: { file: ParsedFile }) {
  const [open, setOpen] = useState(false);
  const lines = useMemo(() => file.content.split("\n").length, [file.content]);
  return (
    <div
      className="overflow-hidden"
      style={{ borderRadius: 8, border: "1px solid var(--frost)" }}
    >
      <div className="flex items-center gap-2 px-2.5 h-9">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 flex items-center gap-2 text-left"
        >
          <span
            className="font-mono text-[10px] transition-transform duration-200 shrink-0"
            style={{
              color: "var(--secondary)",
              transform: open ? "rotate(90deg)" : "none",
              display: "inline-block",
            }}
          >
            ▸
          </span>
          <span className="font-mono text-[11.5px] text-(--primary) truncate">
            {file.path}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[10px] text-(--secondary)">
            {lines} L
          </span>
        </button>
        <CopyButton text={file.content} label="" iconOnly />
      </div>
      {open && (
        <pre
          className="max-h-80 overflow-auto px-3 py-2 font-mono text-[12px] leading-[1.7] whitespace-pre text-(--primary)"
          style={{ borderTop: "1px solid var(--frost)" }}
        >
          <code>{file.content}</code>
        </pre>
      )}
    </div>
  );
}

export function PatchBlock({ patch }: { patch: ParsedPatch }) {
  const [open, setOpen] = useState(false);
  const hunks = useMemo(
    () => (patch.diff.match(/^@@/gm) || []).length,
    [patch.diff],
  );
  const adds = useMemo(
    () => (patch.diff.match(/^\+[^+]/gm) || []).length,
    [patch.diff],
  );
  const removes = useMemo(
    () => (patch.diff.match(/^-[^-]/gm) || []).length,
    [patch.diff],
  );
  return (
    <div
      className="overflow-hidden"
      style={{ borderRadius: 8, border: "1px solid var(--frost)" }}
    >
      <div className="flex items-center gap-2 px-2.5 h-9">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 flex items-center gap-2 text-left"
        >
          <span
            className="font-mono text-[10px] transition-transform duration-200 shrink-0"
            style={{
              color: "var(--secondary)",
              transform: open ? "rotate(90deg)" : "none",
              display: "inline-block",
            }}
          >
            ▸
          </span>
          <span
            className="font-mono text-[11.5px] text-(--primary) truncate"
            dir="ltr"
          >
            {patch.path}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[10px] flex items-center gap-1.5">
            <span style={{ color: "var(--a-green)" }}>+{adds}</span>
            <span style={{ color: "var(--ao-red)" }}>−{removes}</span>
            <span style={{ color: "var(--secondary)" }}>{hunks}h</span>
          </span>
        </button>
        <CopyButton text={patch.diff} label="" iconOnly />
      </div>
      {open && (
        <pre
          className="max-h-80 overflow-auto px-3 py-2 font-mono text-[12px] leading-[1.7] whitespace-pre text-(--primary)"
          style={{ borderTop: "1px solid var(--frost)" }}
          dir="ltr"
        >
          <code>
            {patch.diff.split("\n").map((line, i) => {
              const color = line.startsWith("+")
                ? "var(--a-green)"
                : line.startsWith("-")
                  ? "var(--ao-red)"
                  : line.startsWith("@@")
                    ? "var(--a-blue)"
                    : "var(--secondary)";
              return (
                <span key={i} style={{ color, display: "block" }}>
                  {line || "\u00A0"}
                </span>
              );
            })}
          </code>
        </pre>
      )}
    </div>
  );
}

export function EditBlock({
  edit,
}: {
  edit: { path: string; find: string; replace: string };
}) {
  const [open, setOpen] = useState(false);
  const removes = edit.find.split("\n").length;
  const adds = edit.replace.split("\n").length;
  return (
    <div
      className="overflow-hidden"
      style={{ borderRadius: 8, border: "1px solid var(--frost)" }}
    >
      <div className="flex items-center gap-2 px-2.5 h-9">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="min-w-0 flex-1 flex items-center gap-2 text-left"
        >
          <span
            className="font-mono text-[10px] transition-transform duration-200 shrink-0"
            style={{
              color: "var(--secondary)",
              transform: open ? "rotate(90deg)" : "none",
              display: "inline-block",
            }}
          >
            ▸
          </span>
          <span
            className="font-mono text-[11.5px] text-(--primary) truncate"
            dir="ltr"
          >
            {edit.path}
          </span>
          <span className="ml-auto shrink-0 font-mono text-[10px] flex items-center gap-1.5">
            <span style={{ color: "var(--a-green)" }}>+{adds}</span>
            <span style={{ color: "var(--ao-red)" }}>−{removes}</span>
          </span>
        </button>
        <CopyButton
          text={`<<<<<<< FIND\n${edit.find}\n=======\n${edit.replace}\n>>>>>>> REPLACE`}
          label=""
          iconOnly
        />
      </div>
      {open && (
        <div
          dir="ltr"
          className="px-3 py-2 font-mono text-[12px] leading-[1.7] whitespace-pre"
          style={{ borderTop: "1px solid var(--frost)" }}
        >
          {edit.find.split("\n").map((line, i) => (
            <div
              key={`f-${i}`}
              style={{
                color: "var(--ao-red)",
                background: "rgba(255,26,26,0.06)",
              }}
            >
              - {line || "\u00A0"}
            </div>
          ))}
          {edit.replace.split("\n").map((line, i) => (
            <div
              key={`r-${i}`}
              style={{
                color: "var(--a-green)",
                background: "rgba(17,255,153,0.06)",
              }}
            >
              + {line || "\u00A0"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
