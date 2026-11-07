"use client";

import { TerminalPanel } from "@/components/TerminalPanel";
import { PlanBlock } from "./PlanBlock";
import { FileChangesPanel } from "./FileChangesPanel";

export function WorkspaceBody({
  bodyRef,
  focusMode,
  setFocusMode,
  splitPct,
  onDividerDown,
  log,
  status,
  sendInput,
  handleResize,
  parsed,
  fileChanges,
}: any) {
  return (
    <div
      ref={bodyRef}
      className="flex-1 min-h-0 grid px-4 md:px-6 pb-4 md:pb-5"
      style={{
        gridTemplateColumns: focusMode
          ? "minmax(0, 1fr)"
          : `minmax(0, ${splitPct}fr) 4px minmax(0, ${100 - splitPct}fr)`,
      }}
    >
      <section className="min-h-0 min-w-0 flex flex-col overflow-hidden">
        <TerminalPanel
          log={log}
          status={status}
          onSendInput={sendInput}
          onResize={handleResize}
          focusMode={focusMode}
          onToggleFocus={() => setFocusMode((v: boolean) => !v)}
        />
      </section>

      {!focusMode && (
        <div
          onMouseDown={onDividerDown}
          className="cursor-col-resize transition-colors hover:bg-white/15"
          style={{ background: "var(--frost)" }}
        />
      )}

      {!focusMode && (
        <section className="min-w-0 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 py-6">
            {parsed.plan ? (
              <PlanBlock plan={parsed.plan} />
            ) : (
              <p className="font-mono text-[11px] text-(--secondary)">
                — no notes —
              </p>
            )}
          </div>

          {parsed.commands.trim() && (
            <div
              className="shrink-0 max-h-[30%] overflow-y-auto px-6 md:px-8 py-3"
              style={{ borderTop: "1px solid var(--frost)" }}
            >
              <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-(--secondary) mb-2">
                Commands
              </div>
              <pre className="font-mono text-[11.5px] leading-[1.6] whitespace-pre-wrap wrap-break-word text-(--primary)">
                <code>{parsed.commands}</code>
              </pre>
            </div>
          )}

          <FileChangesPanel fileChanges={fileChanges} />
        </section>
      )}
    </div>
  );
}
