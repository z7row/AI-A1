"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Lock, ShieldAlert } from "lucide-react";
import type { Danger } from "@/lib/dangerous";
import type { ParsedResponse } from "@/lib/types";

export function StatusStrips({
  pendingDangers,
  sensitiveDangers,
  script,
  parsed,
  status,
  statusColor,
  computedProgress,
}: {
  pendingDangers: Danger[];
  sensitiveDangers: Danger[];
  script: string;
  parsed: ParsedResponse;
  status: string;
  statusColor: string;
  computedProgress: number;
}) {
  return (
    <>
      {/* DANGER STRIP */}
      <AnimatePresence>
        {pendingDangers.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="shrink-0 flex items-center gap-2 px-6 md:px-8 h-8 text-[11px]"
              style={{
                background: "rgba(255,26,26,0.08)",
                borderTop: "1px solid var(--frost)",
                borderBottom: "1px solid var(--frost)",
              }}
            >
              <ShieldAlert size={12} style={{ color: "var(--ao-red)" }} />
              <span className="text-(--primary)">
                {pendingDangers.length} dangerous pattern
                {pendingDangers.length > 1 ? "s" : ""} detected — accepting
                will prompt confirmation
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SENSITIVE FILES STRIP */}
      <AnimatePresence>
        {sensitiveDangers && sensitiveDangers.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="shrink-0 flex items-center gap-2 px-6 md:px-8 py-2 text-[11px]"
              style={{
                background: "rgba(255,197,61,0.08)",
                borderTop: "1px solid var(--frost)",
                borderBottom: "1px solid var(--frost)",
              }}
            >
              <Lock size={12} style={{ color: "var(--a-yellow)" }} />
              <span className="text-(--primary)">
                <strong className="font-semibold">Sensitive files detected:</strong>{" "}
                {sensitiveDangers.length} command(s) attempt to access .env or credentials (auto-run blocked)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NO SCRIPT STRIP */}
      {!script && (
        <div
          className="shrink-0 flex items-center gap-2 px-6 md:px-8 py-2 text-[11px]"
          style={{
            background: "rgba(163,163,163,0.06)",
            borderTop: "1px solid var(--frost)",
            borderBottom: "1px solid var(--frost)",
          }}
        >
          <ShieldAlert size={12} style={{ color: "var(--secondary)" }} />
          <span className="text-(--secondary)">
            This response has no commands or files — nothing to run.
          </span>
        </div>
      )}

      {/* PARSE WARNINGS */}
      <AnimatePresence>
        {parsed.warnings && parsed.warnings.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="shrink-0 px-6 md:px-8 py-2 text-[11px]"
              style={{
                background: "rgba(255,26,26,0.06)",
                borderTop: "1px solid var(--frost)",
                borderBottom: "1px solid var(--frost)",
              }}
            >
              <div className="flex items-start gap-2">
                <ShieldAlert
                  size={12}
                  style={{
                    color: "var(--ao-red)",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <div className="min-w-0">
                  <strong className="font-semibold text-(--primary)">
                    {parsed.warnings.length} block
                    {parsed.warnings.length === 1 ? "" : "s"} skipped — the
                    rest will still run:
                  </strong>
                  <ul className="mt-1 space-y-0.5 text-(--secondary)">
                    {parsed.warnings.map((w, i) => (
                      <li key={i}>· {w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OUTPUT NOTES */}
      <AnimatePresence>
        {parsed.outputNotes.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="shrink-0 flex items-center gap-2 px-6 md:px-8 py-2 text-[11px]"
              style={{
                background: "rgba(255,197,61,0.08)",
                borderTop: "1px solid var(--frost)",
                borderBottom: "1px solid var(--frost)",
              }}
            >
              <Eye size={12} style={{ color: "var(--a-yellow)" }} />
              <span className="text-(--primary)">
                <strong className="font-semibold">
                  AI flagged the output:
                </strong>{" "}
                {parsed.outputNotes.join(" · ")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PROGRESS STRIP */}
      <div
        className="shrink-0 flex items-center gap-3 px-6 md:px-8 h-8"
        style={{
          borderTop: "1px solid var(--frost)",
          borderBottom: "1px solid var(--frost)",
        }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em] w-17 shrink-0"
          style={{ color: statusColor }}
        >
          {status}
        </span>
        <div
          className="flex-1 h-0.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full"
            animate={{
              width: `${computedProgress}%`,
              background:
                status === "done" ? "var(--a-green)" : "var(--ao-red)",
            }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <span className="font-mono text-[10px] tabular-nums text-(--secondary) w-9 text-right shrink-0">
          {computedProgress}%
        </span>
      </div>
    </>
  );
}
