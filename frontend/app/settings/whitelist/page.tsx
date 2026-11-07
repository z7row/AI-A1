"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useWhitelist } from "@/lib/whitelistStore";
import { WHITELIST_PRESETS } from "@/lib/whitelist";
import { fadeUp, staggerList } from "@/components/motion";

export default function WhitelistSettingsPage() {
  const wl = useWhitelist();
  const [draft, setDraft] = useState("");

  function addOne(entry: string) {
    const trimmed = entry.trim();
    if (!trimmed) return;
    wl.addEntry(trimmed);
    setDraft("");
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerList(0.06, 0.08)}
      className="mx-auto w-full max-w-[900px] px-5 md:px-8 py-10 md:py-14"
    >
      <motion.header
        variants={fadeUp}
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-(--secondary) hover:text-(--primary)"
          >
            <ArrowLeft size={11} /> Settings
          </Link>
          <h1
            className="font-display mt-2 text-(--primary)"
            style={{
              fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)",
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: "-0.8px",
            }}
          >
            Command whitelist
            <span style={{ color: "var(--ao-red)" }}>.</span>
          </h1>
          <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-(--secondary)">
            Lines from the <code>## commands</code> block are checked one by
            one. If <strong>every</strong> line matches an entry below, the
            run starts immediately. If even one line is missing, you&apos;ll
            be asked to approve the whole batch.
          </p>
        </div>
      </motion.header>

      <motion.section
        variants={fadeUp}
        className="mt-6 p-4 flex items-center justify-between gap-4"
        style={{
          borderRadius: 16,
          border: `1px solid ${wl.enabled ? "var(--frost)" : "rgba(255,26,26,0.5)"}`,
          background: wl.enabled
            ? "var(--ao-bg-surface)"
            : "rgba(255,26,26,0.05)",
        }}
      >
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-(--primary)">
            Whitelist enabled
          </p>
          <p className="mt-1 text-[12px] leading-[1.5] text-(--secondary)">
            When off, every task asks for approval before running.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={wl.enabled}
          onClick={() => wl.setEnabled(!wl.enabled)}
          className="shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.18em] transition-colors"
          style={{
            background: wl.enabled
              ? "rgba(17,255,153,0.14)"
              : "rgba(255,26,26,0.10)",
            border: `1px solid ${
              wl.enabled ? "rgba(17,255,153,0.55)" : "rgba(255,26,26,0.5)"
            }`,
            color: wl.enabled ? "var(--a-green)" : "var(--ao-red)",
          }}
        >
          {wl.enabled ? "ON" : "OFF"}
        </button>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="mt-4 px-5 py-5"
        style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
      >
        <h2 className="text-[13px] font-medium text-(--primary) mb-3">
          Presets
        </h2>
        <div className="flex flex-col gap-4">
          {WHITELIST_PRESETS.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--secondary) mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.entries.map((entry) => {
                  const active = wl.entries.includes(entry);
                  return (
                    <button
                      key={entry}
                      type="button"
                      onClick={() =>
                        active ? wl.removeEntry(entry) : wl.addEntry(entry)
                      }
                      className="font-mono text-[11px] px-2.5 h-7 rounded-full transition-colors"
                      style={{
                        background: active
                          ? "rgba(17,255,153,0.10)"
                          : "var(--ao-bg-surface)",
                        border: `1px solid ${
                          active ? "rgba(17,255,153,0.5)" : "var(--frost)"
                        }`,
                        color: active
                          ? "var(--a-green)"
                          : "var(--ao-text-secondary)",
                      }}
                    >
                      {active ? "✓ " : "+ "}
                      {entry}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="mt-4 px-5 py-5"
        style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
      >
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-[13px] font-medium text-(--primary)">
            Allowed commands · {wl.entries.length}
          </h2>
          <button
            type="button"
            onClick={wl.resetToDefaults}
            className="btn btn-ghost"
          >
            <RotateCcw size={12} /> Reset to defaults
          </button>
        </div>
        {wl.entries.length === 0 ? (
          <p className="font-mono text-[11px] text-(--secondary)">— empty —</p>
        ) : (
          <ul className="space-y-1">
            {wl.entries.map((entry) => (
              <li
                key={entry}
                className="flex items-center gap-2 px-3 h-9 font-mono text-[12px]"
                style={{ border: "1px solid var(--frost)", borderRadius: 8 }}
              >
                <span className="flex-1 text-(--primary) truncate" dir="ltr">
                  {entry}
                </span>
                <button
                  type="button"
                  onClick={() => wl.removeEntry(entry)}
                  className="grid place-items-center w-7 h-7 rounded-full hover:bg-red-500/10"
                  style={{ color: "var(--ao-red)" }}
                  aria-label={`Remove ${entry}`}
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      <motion.section
        variants={fadeUp}
        className="mt-4 px-5 py-5"
        style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
      >
        <h2 className="text-[13px] font-medium text-(--primary) mb-2">
          Add a command
        </h2>
        <p className="font-mono text-[10.5px] text-(--secondary) mb-3 leading-[1.7]">
          Forms: <code>ls</code> (single token) ·{" "}
          <code>git status</code> (multi-token, matches prefix) ·{" "}
          <code>npm *</code> (prefix wildcard) ·{" "}
          <code>/^rsync\s/</code> (regex). Redirections like{" "}
          <code>echo x &gt; file</code> are allowed as long as the target is a
          relative path under cwd.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addOne(draft);
            }}
            spellCheck={false}
            placeholder="e.g. git status"
            className="flex-1 min-w-0 h-9 px-3 font-mono text-[12px] rounded-full outline-none"
            style={{
              background: "var(--ao-bg-surface)",
              border: "1px solid var(--frost)",
              color: "var(--ao-text-primary)",
            }}
          />
          <button
            type="button"
            onClick={() => addOne(draft)}
            disabled={!draft.trim()}
            className="btn btn-primary h-9"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
