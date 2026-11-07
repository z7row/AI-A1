"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useExcludes } from "@/lib/excludesStore";
import { fadeUp, staggerList } from "@/components/motion";

const PRESETS: { label: string; entries: string[] }[] = [
  { label: "Dependencies", entries: ["node_modules"] },
  { label: "VCS", entries: [".git"] },
  {
    label: "Build outputs",
    entries: [".next", "dist", "build", "out", "target"],
  },
  {
    label: "Virtualenvs",
    entries: [".venv", "venv", "env"],
  },
  {
    label: "Caches",
    entries: ["__pycache__", ".cache", ".turbo", ".parcel-cache"],
  },
  {
    label: "Editors",
    entries: [".idea", ".vscode"],
  },
  {
    label: "Lockfiles",
    entries: [
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
      "npm-shrinkwrap.json",
    ],
  },
  { label: "System", entries: [".DS_Store"] },
];

export default function ExcludesSettingsPage() {
  const ex = useExcludes();
  const [draft, setDraft] = useState("");

  function addOne(entry: string) {
    const trimmed = entry.trim();
    if (!trimmed) return;
    ex.addEntry(trimmed);
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
            File tree excludes
            <span style={{ color: "var(--ao-red)" }}>.</span>
          </h1>
          <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-(--secondary)">
            These names are skipped when building the flat file list that is
            prepended to the prompt you copy from the Run page. Add folders or
            files you don&apos;t want to clutter the AI&apos;s context.
          </p>
        </div>
      </motion.header>

      <motion.section
        variants={fadeUp}
        className="mt-6 px-5 py-5"
        style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
      >
        <h2 className="text-[13px] font-medium text-(--primary) mb-3">
          Presets
        </h2>
        <div className="flex flex-col gap-4">
          {PRESETS.map((group) => (
            <div key={group.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--secondary) mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.entries.map((entry) => {
                  const active = ex.entries.includes(entry);
                  return (
                    <button
                      key={entry}
                      type="button"
                      onClick={() =>
                        active ? ex.removeEntry(entry) : ex.addEntry(entry)
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
            Excluded names · {ex.entries.length}
          </h2>
          <button
            type="button"
            onClick={ex.resetToDefaults}
            className="btn btn-ghost"
          >
            <RotateCcw size={12} /> Reset to defaults
          </button>
        </div>
        {ex.entries.length === 0 ? (
          <p className="font-mono text-[11px] text-(--secondary)">— empty —</p>
        ) : (
          <ul className="space-y-1">
            {ex.entries.map((entry) => (
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
                  onClick={() => ex.removeEntry(entry)}
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
          Add a name
        </h2>
        <p className="font-mono text-[10.5px] text-(--secondary) mb-3 leading-[1.7]">
          Match against a single path segment — either a folder name like{" "}
          <code>node_modules</code> or a file name like{" "}
          <code>package-lock.json</code>. No wildcards, no paths.
        </p>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addOne(draft);
            }}
            spellCheck={false}
            placeholder="e.g. .turbo"
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
