"use client";

import { useEffect, useRef, useState } from "react";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";
import type { SearchAddon } from "@xterm/addon-search";
import {
  ChevronDown,
  ChevronUp,
  PanelRightClose,
  PanelRightOpen,
  Search,
  X,
} from "lucide-react";
import "@xterm/xterm/css/xterm.css";
import { CopyButton } from "./CopyButton";

/** Strip ANSI escape sequences so pasted text is clean. */
function cleanForCopy(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}

export function TerminalPanel({
  log,
  status,
  onSendInput,
  onResize,
  focusMode = false,
  onToggleFocus,
}: {
  log: string;
  status: string;
  onSendInput?: (data: string) => void;
  onResize?: (rows: number, cols: number) => void;
  focusMode?: boolean;
  onToggleFocus?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const searchRef = useRef<SearchAddon | null>(null);
  const writtenRef = useRef(0);
  const onDataRef = useRef(onSendInput);
  const onResizeRef = useRef(onResize);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onDataRef.current = onSendInput;
  }, [onSendInput]);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  /* init terminal once */
  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    const term = new (require("@xterm/xterm").Terminal)({
      convertEol: true,
      cursorBlink: true,
      fontSize: 13,
      fontFamily:
        'JetBrains Mono, ui-monospace, "SF Mono", Menlo, monospace',
      theme: {
        background: "#000000",
        foreground: "#f0f0f0",
        cursor: "#ff1a1a",
        selectionBackground: "rgba(255,26,26,0.35)",
        black: "#000000",
        red: "#ff1a1a",
        green: "#11ff99",
        yellow: "#ffc53d",
        blue: "#3b9eff",
        magenta: "#ff55ff",
        cyan: "#55ffff",
        white: "#f0f0f0",
        brightBlack: "#666666",
        brightRed: "#ff3333",
        brightGreen: "#22ff99",
        brightYellow: "#ffd666",
        brightBlue: "#5cb3ff",
        brightMagenta: "#ff77ff",
        brightCyan: "#77ffff",
        brightWhite: "#ffffff",
      },
      scrollback: 10000,
      allowProposedApi: true,
    });

    const fitMod = require("@xterm/addon-fit");
    const fit = new fitMod.FitAddon();
    term.loadAddon(fit);

    const linksMod = require("@xterm/addon-web-links");
    const links = new linksMod.WebLinksAddon();
    term.loadAddon(links);

    const searchMod = require("@xterm/addon-search");
    const search = new searchMod.SearchAddon();
    term.loadAddon(search);

    term.open(containerRef.current);
    try {
      fit.fit();
    } catch {}
    termRef.current = term;
    fitRef.current = fit;
    searchRef.current = search;

    const dataDisposable = term.onData((data: string) => {
      onDataRef.current?.(data);
    });

    const ro = new ResizeObserver(() => {
      if (disposed) return;
      try {
        fit.fit();
      } catch {}
      // The socket may not be connected yet on first mount. The callback
      // guard lives in the page, but wrap here too so nothing escapes as
      // an uncaught error even if a future caller forgets the check.
      try {
        onResizeRef.current?.(term.rows, term.cols);
      } catch {
        /* socket not ready — ignore this frame */
      }
    });
    ro.observe(containerRef.current);

    return () => {
      disposed = true;
      ro.disconnect();
      dataDisposable.dispose();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
      searchRef.current = null;
      writtenRef.current = 0;
    };
  }, []);

  /* write log delta */
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;

    if (log.length < writtenRef.current) {
      term.clear();
      term.write("\x1b[2J\x1b[H");
      writtenRef.current = 0;
    }

    const delta = log.slice(writtenRef.current);
    if (!delta) return;
    term.write(delta);
    writtenRef.current = log.length;
    try {
      term.scrollToBottom();
    } catch {}
  }, [log]);

  /* global Ctrl+F */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        searchRef.current?.clearDecorations();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function runSearch(dir: "next" | "prev", value: string = query) {
    if (!value || !searchRef.current) {
      searchRef.current?.clearDecorations();
      return;
    }
    const opts = {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
      decorations: {
        matchBackground: "#ffc53d",
        matchOverviewRuler: "#ffc53d",
        activeMatchBackground: "#ff1a1a",
        activeMatchColorOverviewRuler: "#ff1a1a",
      },
    };
    if (dir === "next") searchRef.current.findNext(value, opts);
    else searchRef.current.findPrevious(value, opts);
  }

  return (
    <>
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-4 h-10"
        style={{ borderBottom: "1px solid var(--frost)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="block w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background:
                status === "running" || status === "pending"
                  ? "var(--ao-red)"
                  : status === "done"
                    ? "var(--a-green)"
                    : status === "failed" || status === "killed"
                      ? "var(--ao-red)"
                      : "var(--secondary)",
              animation:
                status === "running" || status === "pending"
                  ? "pulseRed 1.6s ease-out infinite"
                  : undefined,
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--primary)">
            Output
          </span>
          {(status === "running" || status === "pending") && (
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--secondary)">
              · interactive
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onToggleFocus && (
            <button
              type="button"
              onClick={onToggleFocus}
              className="p-1.5 text-(--secondary) hover:text-(--primary) transition-colors"
              title={focusMode ? "Show sidebar" : "Hide sidebar"}
            >
              {focusMode ? (
                <PanelRightOpen size={13} />
              ) : (
                <PanelRightClose size={13} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              window.setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="p-1.5 text-(--secondary) hover:text-(--primary) transition-colors"
            title="Search (Ctrl+F)"
          >
            <Search size={12} />
          </button>
          <CopyButton text={log} label="copy" />
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div
          className="shrink-0 flex items-center gap-2 px-3 h-10"
          style={{
            borderBottom: "1px solid var(--frost)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Search size={12} style={{ color: "var(--secondary)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              runSearch("next", e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch(e.shiftKey ? "prev" : "next");
              }
              if (e.key === "Escape") {
                setSearchOpen(false);
                setQuery("");
                searchRef.current?.clearDecorations();
              }
            }}
            placeholder="find in output…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent font-mono text-[12px] text-(--primary) placeholder:text-(--secondary) outline-none"
          />
          <button
            type="button"
            onClick={() => runSearch("prev")}
            className="p-1 text-(--secondary) hover:text-(--primary) transition-colors"
            title="Previous (Shift+Enter)"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => runSearch("next")}
            className="p-1 text-(--secondary) hover:text-(--primary) transition-colors"
            title="Next (Enter)"
          >
            <ChevronDown size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setQuery("");
              searchRef.current?.clearDecorations();
            }}
            className="p-1 text-(--secondary) hover:text-(--primary) transition-colors"
            title="Close (Esc)"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 min-h-0"
        style={{ padding: "8px 6px 6px 12px", background: "#000" }}
      />
    </>
  );
}
