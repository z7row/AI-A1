"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileCode2, Loader2, Trash2 } from "lucide-react";
import { deleteHistory, listHistory } from "@/lib/api-history";
import { fadeUp, staggerList } from "@/components/motion";
import type { HistoryMeta } from "@/lib/types";

function fmtDuration(a: number | null, b: number | null): string {
  if (!a || !b) return "—";
  const s = Math.max(0, Math.round(b - a));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs}s`;
}

function fmtTime(t: number | null): string {
  if (!t) return "—";
  const d = new Date(t * 1000);
  return d.toLocaleString();
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryMeta[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    try {
      const d = await listHistory();
      setItems(d);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id: string) {
    if (!confirm(`Delete history for ${id}?`)) return;
    setBusy(id);
    try {
      await deleteHistory(id);
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 md:px-8 py-10 md:py-14">
      <header className="flex items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--secondary)">
            history
          </span>
          <h1
            className="font-display mt-2 text-(--primary)"
            style={{
              fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)",
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: "-0.8px",
            }}
          >
            Past runs
            <span style={{ color: "var(--ao-red)" }}>.</span>
          </h1>
          <p className="mt-3 text-[13.5px] leading-[1.6] text-(--secondary)">
            Every completed task, with the files it created or changed and the
            full diff.
          </p>
        </div>

        <button className="btn btn-outline" onClick={refresh}>
          Refresh
        </button>
      </header>

      <div className="mt-8">
        {items === null ? (
          <div className="flex items-center gap-2 text-(--secondary) font-mono text-[12px]">
            <Loader2 size={14} className="animate-spin" />
            loading…
          </div>
        ) : items.length === 0 ? (
          <p className="font-mono text-[12px] text-(--secondary)">
            — no history yet —
          </p>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerList(0.05)}
            className="grid grid-cols-1"
            style={{ borderTop: "1px solid var(--frost)" }}
          >
            {items.map((it) => {
              const tone =
                it.status === "done"
                  ? "var(--a-green)"
                  : it.status === "failed" || it.status === "killed"
                    ? "var(--ao-red)"
                    : "var(--secondary)";
              return (
                <motion.div
                  key={it.id}
                  variants={fadeUp}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.015)" }}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 py-4 items-center"
                  style={{ borderBottom: "1px solid var(--frost)" }}
                >
                  <Link href={`/history/${it.id}`} className="min-w-0 group">
                    <div className="flex items-center gap-2">
                      <span
                        className="block w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: tone }}
                      />
                      <span className="font-mono text-[10px] text-(--secondary) shrink-0">
                        {it.id.slice(0, 8)}
                      </span>
                      <span className="text-[13.5px] text-(--primary) truncate group-hover:text-accent transition-colors">
                        {it.title || "Untitled"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[10.5px] text-(--secondary)">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {fmtDuration(it.started_at, it.finished_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCode2 size={10} />
                        {it.changes_count} change
                        {it.changes_count === 1 ? "" : "s"}
                      </span>
                      <span className="truncate" dir="ltr">
                        {it.cwd}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
                    <span className="font-mono text-[10px] text-(--secondary)">
                      {fmtTime(it.started_at)}
                    </span>
                    <Link href={`/history/${it.id}`} className="btn btn-ghost">
                      <ArrowRight size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(it.id)}
                      disabled={busy === it.id}
                      className="btn btn-ghost"
                      title="Delete"
                    >
                      {busy === it.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
