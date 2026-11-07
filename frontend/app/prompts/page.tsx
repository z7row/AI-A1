"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useFirstPrompt, useCustomPrompt } from "@/lib/promptStore";
import { fadeUp, staggerList } from "@/components/motion";

type Tab = "first" | "custom";

export default function PromptsPage() {
  const [tab, setTab] = useState<Tab>("first");
  const first = useFirstPrompt();
  const custom = useCustomPrompt();
  const p = tab === "first" ? first : custom;

  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<"saved" | "copied" | null>(null);

  useEffect(() => {
    setDraft(p.custom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, p.custom]);

  function flashSet(kind: "saved" | "copied") {
    setFlash(kind);
    window.setTimeout(() => setFlash(null), 1500);
  }

  function save() {
    p.saveCustom(draft);
    flashSet("saved");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      flashSet("copied");
    } catch {}
  }

  function loadDefaultIntoEditor() {
    setDraft(p.defaultValue);
  }

  function deleteCustom() {
    if (
      !confirm(
        "Delete your saved custom prompt for this tab? The default is always kept, but your edits will be lost.",
      )
    ) {
      return;
    }
    p.deleteCustom();
    setDraft(p.defaultValue);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerList(0.08, 0.08)}
      className="h-dvh flex flex-col overflow-hidden"
    >
      {/* ── Header ────────────────────────────── */}
      <motion.header
        variants={fadeUp}
        className="shrink-0 px-6 md:px-8 pt-6 md:pt-8 pb-4"
      >
        <span
          className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{
            border: "1px solid var(--frost)",
            color: "var(--tertiary)",
          }}
        >
          prompts
        </span>
        <h1
          className="font-display mt-3 text-(--primary)"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: "-0.03em",
          }}
        >
          Prompts
          <span style={{ color: "var(--tertiary)" }}>.</span>
        </h1>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-[1.6] text-(--secondary)">
          The <strong className="text-(--primary)">default</strong> comes from
          the code and can never be lost. Your edits live in the browser and
          are used wherever you copy a prompt. Load default to preview the
          original, then Save &amp; activate to use your version.
        </p>
      </motion.header>

      {/* ── Tabs ──────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="shrink-0 flex gap-2 px-6 md:px-8 pb-3"
      >
        {(["first", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-medium transition-colors"
            style={{
              border: "1px solid var(--frost)",
              background:
                tab === t ? "var(--ao-bg-subtle)" : "var(--ao-bg-surface)",
              color:
                tab === t
                  ? "var(--ao-text-primary)"
                  : "var(--ao-text-secondary)",
            }}
          >
            {t === "custom" && <Sparkles size={13} />}
            {t === "first" ? "First prompt" : "Custom prompt"}
          </button>
        ))}
      </motion.div>

      {/* ── Toolbar ───────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-6 md:px-8 pb-3"
        style={{ borderBottom: "1px solid var(--frost)" }}
      >
        <div className="flex items-center gap-3 pt-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{
              border: "1px solid var(--frost)",
              color: p.isCustom
                ? "var(--a-green)"
                : "var(--ao-text-secondary)",
            }}
          >
            <span
              className="block w-1 h-1 rounded-full"
              style={{
                background: p.isCustom
                  ? "var(--a-green)"
                  : "var(--secondary)",
              }}
            />
            {p.isCustom ? "using custom" : "using default"}
          </span>

          {p.hasCustom && !p.isCustom && (
            <button
              onClick={p.useCustom}
              className="font-mono text-[10.5px] uppercase tracking-[0.18em] hover:underline"
              style={{ color: "var(--tertiary)" }}
            >
              re-activate custom
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <button
            onClick={loadDefaultIntoEditor}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium text-(--primary) transition-colors hover:bg-white/[0.06]"
            style={{ border: "1px solid var(--frost)" }}
            title="Load the built-in default into the editor (saves nothing)"
          >
            <RotateCcw size={13} />
            Load default
          </button>

          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium text-(--primary) transition-colors hover:bg-white/[0.06]"
            style={{ border: "1px solid var(--frost)" }}
          >
            {flash === "copied" ? <Check size={13} /> : <Copy size={13} />}
            {flash === "copied" ? "Copied" : "Copy editor"}
          </button>

          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] font-semibold transition-colors"
            style={{
              background: "var(--ao-text-primary)",
              color: "var(--ao-bg-canvas)",
              border: "none",
            }}
          >
            {flash === "saved" ? <Check size={13} /> : <Save size={13} />}
            {flash === "saved" ? "Saved" : "Save & activate"}
          </button>

          {p.hasCustom && (
            <button
              onClick={deleteCustom}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-red-500/10"
              style={{
                border: "1px solid var(--frost)",
                color: "var(--ao-red)",
              }}
              title="Delete saved custom prompt"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Editor ────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="flex-1 min-h-0 p-4 md:p-5"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="w-full h-full resize-none font-mono text-[12.5px] leading-[1.7] px-5 py-4 text-(--primary) outline-none transition-colors"
          style={{
            borderRadius: 20,
            background: "var(--ao-bg-surface)",
            border: "1px solid var(--frost)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
