"use client";

import { Ban, Info, Play } from "lucide-react";
import { QuickStartButton } from "@/components/QuickStartButton";
import { WorkspaceMenu } from "./WorkspaceMenu";

export function WorkspaceHeader({
  parsed,
  cwd,
  running,
  script,
  handleCancel,
  handleAccept,
  setShowDetails,
  handleNew,
  router,
  menuOpen,
  setMenuOpen,
  menuRef,
  autoCopy,
  toggleAutoCopy,
  notifyOn,
  toggleNotify,
  log,
  handleDownload,
  handleClear,
  setTaskKey,
}: any) {
  return (
    <header className="shrink-0 px-6 md:px-8 pt-2 md:pt-3 pb-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <h1
            className="font-display text-(--primary) wrap-break-word"
            style={{
              fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)",
              lineHeight: 1.15,
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            {parsed.title ?? "Untitled task"}
            <span style={{ color: "var(--tertiary)" }}>.</span>
          </h1>
          {cwd && (
            <p
              className="mt-1 font-mono text-[10.5px] text-(--secondary) truncate"
              dir="ltr"
              title={cwd}
            >
              {cwd}
            </p>
          )}
        </div>
        <div
          className="flex items-center gap-2 shrink-0 relative"
          ref={menuRef}
        >
          {running ? (
            <button
              type="button"
              className="btn btn-secondary h-9"
              onClick={handleCancel}
            >
              <Ban size={13} />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              type="button"
              id="ao-run-button"
              className="btn btn-primary h-9"
              onClick={handleAccept}
              disabled={!script}
            >
              <Play size={13} />
              <span>Run</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="btn btn-outline h-9"
          >
            <Info size={13} />
            <span>Details</span>
          </button>
          <QuickStartButton
            label="Paste & go"
            className="btn btn-outline h-9"
            iconSize={13}
            onSuccess={() => setTaskKey((k: number) => k + 1)}
          />

          <button
            type="button"
            onClick={() => setMenuOpen((v: boolean) => !v)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full transition-colors hover:bg-white/6 shrink-0"
            style={{
              border: "1px solid var(--frost)",
              color: "var(--ao-text-primary)",
            }}
            aria-label="More"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: "currentColor",
                }}
              />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: "currentColor",
                }}
              />
              <span
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: "currentColor",
                }}
              />
            </span>
          </button>
          {menuOpen && (
            <WorkspaceMenu
              autoCopy={autoCopy}
              toggleAutoCopy={toggleAutoCopy}
              notifyOn={notifyOn}
              toggleNotify={toggleNotify}
              log={log}
              handleDownload={handleDownload}
              handleClear={handleClear}
              router={router}
              setMenuOpen={setMenuOpen}
            />
          )}
        </div>
      </div>
    </header>
  );
}
