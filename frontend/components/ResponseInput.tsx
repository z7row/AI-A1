"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardPaste,
  CornerDownLeft,
  Eraser,
  FolderOpen,
} from "lucide-react";

import { CopyButton } from "./CopyButton";
import { FolderPicker } from "./FolderPicker";
import { parseAiResponse } from "@/lib/parseResponse";
import type { ParsedResponse } from "@/lib/types";
import { getBackendCwd } from "@/lib/api";
import { Button } from "./ui/button";

const CWD_KEY = "ao-cwd";

export function ResponseInput({
  value,
  onChange,
  onStart,
  disabled,
  serverOnline,
}: {
  value: string;
  onChange: (v: string) => void;
  onStart: (cwd: string) => void;
  disabled?: boolean;
  serverOnline: boolean;
}) {
  const [cwd, setCwd] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [preview, setPreview] = useState<ParsedResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CWD_KEY);

    if (saved) {
      setCwd(saved);
      return;
    }

    getBackendCwd().then((dir) => {
      if (dir) {
        setCwd(dir);
      }
    });
  }, []);

  useEffect(() => {
    if (!value.trim()) {
      setPreview(null);
      setParseError(null);
      return;
    }

    const parsed = parseAiResponse(value);

    if (parsed.ok) {
      setPreview(parsed.data);
      setParseError(null);
    } else {
      setPreview(null);
      setParseError(parsed.error);
    }
  }, [value]);

  function pickFolder(path: string) {
    setCwd(path);
    localStorage.setItem(CWD_KEY, path);
    setPickerOpen(false);
  }

  async function paste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      onChange(clipboardText);
      ta.current?.focus();
    } catch {
      // Clipboard permission denied.
    }
  }

  const canStart =
    serverOnline && !disabled && cwd.trim().length > 0 && preview !== null;

  return (
    <>
      <div
        className="
          flex
          h-full
          flex-col
          overflow-hidden
          rounded-3xl
          bg-(--neutral)
        "
        style={{
          border: "1px solid var(--frost)",
          boxShadow: "var(--ring) 0 0 0 1px",
        }}
      >
        {/* HEADER */}
        <header
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            justify-between
            gap-3
            px-5
            pt-4
            md:px-6
          "
        >
          <div className="flex items-center gap-3">
            <div>
              <h1
                className="
                  font-display
                  text-[1.35rem]
                  leading-[1.2]
                  tracking-[-0.4px]
                  text-(--primary)
                "
              >
                AI Response
              </h1>

              <p className="mt-0.5 text-[11px] text-(--secondary)">
                Paste the generated task response
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              onClick={paste}
              className="
                inline-flex
                py-1
                items-center
                gap-2
                rounded-pill
                px-
                font-mono
                text-[10px]
                uppercase
                tracking-[0.08em]
                text-(--secondary)
              

                hover:text-(--primary)
              "
              size={"sm"}
            >
              <ClipboardPaste size={13} />
              Paste
            </Button>

            <CopyButton text={value} label="Copy" />

            <Button
              type="button"
              onClick={() => onChange("")}
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-pill
                px-3
                font-mono
                text-[10px]
                uppercase
                tracking-[0.08em]
                text-(--secondary)
                transition-colors
                duration-180
                hover:text-(--primary)
              "
            >
              <Eraser size={13} />
              Clear
            </Button>
          </div>
        </header>

        {/* TEXTAREA AREA */}
        <div className="min-h-0 flex-1 p-4 md:p-5">
          <textarea
            ref={ta}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder={`Paste the AI's markdown response here.`}
            className="
              h-full
              w-full
              resize-none
              rounded-2xl
              bg-(--surface)
              px-4
              py-4
              font-mono
              text-[12px]
              leading-[1.6]
              text-(--primary)
              outline-none
              placeholder:text-(--secondary)
            "
            style={{
              border: "1px solid var(--frost)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--tertiary)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--frost)";
            }}
          />
        </div>

        {/* FOOTER */}
        <footer
          className="
            shrink-0
            px-4
            pb-4
            md:px-5
            md:pb-5
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              rounded-[8px]
              p-3
              md:flex-row
              md:items-center
            "
            style={{
              border: "1px solid var(--frost)",
            }}
          >
            {/* Folder */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="
                flex
                min-w-0
                flex-1
                items-center
                gap-2.5
                rounded-
                px-3
                py-2.5
                text-left
                transition-colors
                duration-180
              "
              style={{
                border: "1px solid var(--frost)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--frost)";
              }}
            >
              <FolderOpen size={14} className="shrink-0 text-(--tertiary)" />

              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-(--secondary)">
                  Working directory
                </p>

                <p className="mt-0.5 truncate font-mono text-[11px] text-(--primary)">
                  {cwd || "Choose a working directory…"}
                </p>
              </div>
            </button>

            {/* Start */}
            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStart(cwd.trim())}
              className="
                inline-flex
                h-[46px]
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-pill
                px-6
                text-[13px]
                font-semibold
                transition-all
                duration-180
                disabled:cursor-not-allowed
                disabled:opacity-[0.45]
                md:min-w-[120px]
              "
              style={{
                background: "var(--primary)",
                color: "var(--neutral)",
                border: "none",
              }}
              title={
                !serverOnline
                  ? "Server offline"
                  : !preview
                    ? "Response not parsed yet"
                    : !cwd
                      ? "Pick a working directory"
                      : undefined
              }
            >
              <CornerDownLeft size={15} />
              Start
            </button>
          </div>
        </footer>
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
