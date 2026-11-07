"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  ClipboardPaste,
  CornerDownLeft,
  Eraser,
  FolderOpen,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { CopyButton } from "@/components/CopyButton";
import { fadeUp, staggerList } from "@/components/motion";
import { FolderPicker } from "@/components/FolderPicker";
import { QuickStartButton } from "@/components/QuickStartButton";
import { useFirstPrompt, useCustomPrompt } from "@/lib/promptStore";
import { getBackendCwd, getFileTree, pingServer } from "@/lib/api";
import { useExcludes } from "@/lib/excludesStore";
import { parseAiResponse } from "@/lib/parseResponse";
import type { ParsedResponse } from "@/lib/types";

const CWD_KEY = "ao-cwd";

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group inline-block">
      <a
        href={href}
        aria-label={label}
        className="
          inline-flex items-center justify-center w-9 h-9
          text-(--ao-text-primary)
          transition-colors duration-150
          hover:bg-white/5
        "
        style={{ borderRadius: 9999, border: "1px solid var(--frost)" }}
      >
        {children}
      </a>
      <span
        className="
          pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2
          px-2.5 py-1.5 rounded-md text-[11.5px] font-medium whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50
        "
        style={{
          background: "var(--ao-bg-subtle)",
          color: "var(--ao-text-primary)",
          border: "1px solid var(--frost)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function RunPage() {
  const router = useRouter();
  const ta = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState(`# AiA1 Tool 

## notes
# GOOOOOOOOOD

## commands
mkdir -p .aia1
echo "<h1> all Ok!</h1>" > .aia1/test.html
echo "ok!"`);
  const [cwd, setCwd] = useState("");
  const [online, setOnline] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const [preview, setPreview] = useState<ParsedResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [tree, setTree] = useState<string | null>(null);
  const [treeCount, setTreeCount] = useState(0);
  const [treeTruncated, setTreeTruncated] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [treeReloadKey, setTreeReloadKey] = useState(0);

  const excludes = useExcludes();
  const firstPrompt = useFirstPrompt();
  const customPrompt = useCustomPrompt();

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const ok = await pingServer();
      if (alive) setOnline(ok);
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(CWD_KEY);
    if (saved) {
      setCwd(saved);
      return;
    }
    getBackendCwd().then((dir) => {
      if (dir) setCwd(dir);
    });
  }, []);

  useEffect(() => {
    if (!cwd) {
      setTree(null);
      setTreeCount(0);
      setTreeTruncated(false);
      setTreeError(null);
      return;
    }
    if (!excludes.loaded) return;
    let alive = true;
    setTreeLoading(true);
    setTreeError(null);
    getFileTree(cwd, excludes.entries)
      .then((res) => {
        if (!alive) return;
        setTree(res.tree);
        setTreeCount(res.count);
        setTreeTruncated(res.truncated);
      })
      .catch((e) => {
        if (!alive) return;
        setTreeError((e as Error).message || "fetch failed");
        setTree(null);
        setTreeCount(0);
        setTreeTruncated(false);
      })
      .finally(() => {
        if (alive) setTreeLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [cwd, excludes.loaded, excludes.entries, treeReloadKey]);

  useEffect(() => {
    if (!text.trim()) {
      setPreview(null);
      setParseError(null);
      return;
    }
    const parsed = parseAiResponse(text);
    if (parsed.ok) {
      setPreview(parsed.data);
      setParseError(null);
    } else {
      setPreview(null);
      setParseError(parsed.error);
    }
  }, [text]);

  function pickFolder(path: string) {
    setCwd(path);
    localStorage.setItem(CWD_KEY, path);
    setPickerOpen(false);
  }

  async function paste() {
    try {
      const t = await navigator.clipboard.readText();
      setText(t);
      requestAnimationFrame(() => ta.current?.focus());
    } catch {}
  }

  function clearResponse() {
    setText("");
    ta.current?.focus();
  }

  function start() {
    if (!canStart) return;
    sessionStorage.setItem("ao-response-text", text);
    sessionStorage.setItem("ao-task-cwd", cwd.trim());
    router.push("/workspace");
  }

  const canStart =
    online &&
    text.trim().length > 0 &&
    cwd.trim().length > 0 &&
    preview !== null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (pickerOpen) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "Enter") {
        e.preventDefault();
        if (canStart) start();
      } else if (ctrl && e.shiftKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        paste();
      } else if (ctrl && e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        clearResponse();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStart, pickerOpen]);

  let treeHeader = "";
  if (cwd) {
    if (treeLoading || !excludes.loaded) {
      treeHeader = "Project structure (loading…)\n\n";
    } else if (treeError) {
      treeHeader = `Project structure (unavailable: ${treeError})\n\n`;
    } else if (tree) {
      treeHeader = "Project structure:\n\n" + tree + "\n\n";
      if (treeTruncated) {
        treeHeader += `(listing truncated at ${treeCount} files — add more excludes in Settings → File tree excludes)\n\n`;
      }
    }
  }

  const firstPromptFull = treeHeader + firstPrompt.value;

  return (
    <>
      <div
        className="
          h-dvh
          grid
          grid-rows-[auto_auto_minmax(0,1fr)]
          w-full
          px-5 md:px-8
          py-5
          gap-4
          overflow-hidden
        "
      >
        {/* ═══════════ HERO HEADER ═══════════ */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={staggerList(0.08, 0.08)}
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <span
                className="inline-flex items-center gap-2 px-3 h-6 rounded-full font-mono text-[10.5px] uppercase tracking-[0.2em]"
                style={{
                  border: "1px solid var(--frost)",
                  color: online ? "var(--a-green)" : "var(--ao-red)",
                }}
              >
                <span
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: online ? "var(--a-green)" : "var(--ao-red)",
                    boxShadow: online
                      ? "0 0 8px rgba(17,255,153,0.6)"
                      : "0 0 8px rgba(255,26,26,0.6)",
                  }}
                />
                {online ? "server online" : "server offline"}
              </span>

              <h1
                className="font-display mt-3 text-(--primary)"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  lineHeight: 1.1,
                  fontWeight: 400,
                  letterSpacing: "-0.03em",
                }}
              >
                AI Response
                <span style={{ color: "var(--tertiary)" }}>.</span>
              </h1>

              <p className="mt-1.5 max-w-[60ch] text-[13px] leading-[1.55] text-(--secondary)">
                Paste the model&rsquo;s Markdown below. The runner parses the
                plan, the commands, and every file before anything executes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setTreeReloadKey((k) => k + 1)}
                disabled={!cwd || treeLoading}
                className="inline-flex items-center justify-center w-9 h-9 transition-colors duration-150 hover:bg-white/5"
                style={{
                  borderRadius: 9999,
                  border: "1px solid var(--frost)",
                  color: treeLoading
                    ? "var(--ao-text-secondary)"
                    : "var(--ao-text-primary)",
                }}
                title="Refresh project structure"
              >
                <RefreshCw
                  size={14}
                  className={treeLoading ? "animate-spin" : ""}
                />
              </button>
              <div
                style={{
                  border: "1px solid var(--frost)",
                  borderRadius: 9999,
                }}
              >
                <CopyButton
                  text={firstPromptFull}
                  label="Copy prompt"
                  iconOnly
                />
              </div>
              <IconLink href="/explain" label="Docs">
                <BookOpen size={15} />
              </IconLink>
              <QuickStartButton
                label="Paste & go"
                className="btn btn-primary h-9"
                iconSize={14}
              />
              <button
                type="button"
                id="ao-paste-button"
                onClick={paste}
                className="btn btn-secondary h-9"
              >
                <ClipboardPaste size={14} />
                Paste
              </button>
              <button
                type="button"
                onClick={clearResponse}
                disabled={!text}
                className="btn btn-secondary h-9"
              >
                <Eraser size={14} />
                Clear
              </button>
              <button
                type="button"
                id="ao-start-button"
                disabled={!canStart}
                onClick={start}
                className="btn btn-primary h-9"
                style={{ paddingInline: 22 }}
                title={
                  !online
                    ? "Server offline"
                    : !preview
                      ? "Response not parsed yet"
                      : !cwd
                        ? "Pick a working directory"
                        : undefined
                }
              >
                <CornerDownLeft size={14} />
                Start
              </button>
            </div>
          </motion.div>

          {text.trim() && (
            <motion.div
              variants={fadeUp}
              className="mt-3 flex items-center gap-2 min-w-0"
            >
              {parseError ? (
                <>
                  <XCircle
                    size={13}
                    className="shrink-0"
                    style={{ color: "var(--a-red)" }}
                  />
                  <span
                    className="font-mono text-[11.5px] truncate"
                    style={{ color: "var(--a-red)" }}
                  >
                    {parseError}
                  </span>
                </>
              ) : preview ? (
                <>
                  <CheckCircle2
                    size={13}
                    className="shrink-0"
                    style={{ color: "var(--a-green)" }}
                  />
                  <span className="font-mono text-[11.5px] text-(--secondary)">
                    Parsed · {preview.files.length} file
                    {preview.files.length === 1 ? "" : "s"}
                    {preview.commands.trim() ? " · commands" : ""}
                  </span>
                </>
              ) : null}
            </motion.div>
          )}
        </motion.header>

        {/* ═══════════ FOLDER PICKER ROW ═══════════ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full"
        >
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="
              group w-full flex items-center gap-4
              px-3 md:px-4 h-12 text-left
              transition-colors duration-150
              hover:bg-white/3
            "
            style={{
              borderRadius: 9999,
              border: "1px solid var(--frost)",
              background: "var(--ao-bg-surface)",
            }}
          >
            <span
              className="shrink-0 grid place-items-center w-9 h-9 rounded-full transition-colors"
              style={{
                background: "rgba(255,26,26,0.10)",
                color: "var(--tertiary)",
              }}
            >
              <FolderOpen size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-(--secondary)">
                Working directory
              </p>
              <p className="mt-0.5 truncate font-mono text-[12px] text-(--primary)">
                {cwd || "Choose a working directory…"}
              </p>
            </div>
          </button>
        </motion.div>

        {/* ═══════════ TEXTAREA ═══════════ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="min-h-0 flex"
        >
          <textarea
            ref={ta}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            placeholder={`## title
Ai a1 Tool | list dir by "ls" and sleep 1 second

## commands
mkdir -p .aia1
echo "<h1> all Ok!</h1>" > .aia1/test.html
sleep 1
echo "ok!"
    `}
            className="
              w-full h-full resize-none
              font-mono text-[13.5px] leading-[1.7]
              px-6 py-5 md:px-7 md:py-6
              text-(--primary)
              placeholder:text-(--secondary)
              outline-none
              transition-colors duration-150
            "
            style={{
              borderRadius: 20,
              background: "var(--ao-bg-surface)",
              border: `1px solid ${
                focused ? "var(--tertiary)" : "var(--frost)"
              }`,
              boxShadow: focused ? "0 0 0 4px rgba(255,26,26,0.08)" : "none",
            }}
          />
        </motion.div>
      </div>

      <FolderPicker
        open={pickerOpen}
        initial={cwd || null}
        onCancel={() => setPickerOpen(false)}
        onPick={pickFolder}
      />
    </>
  );
}
