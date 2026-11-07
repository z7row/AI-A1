"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { DiffViewer } from "@/components/DiffViewer";
import { CopyButton } from "@/components/CopyButton";
import { ShowMore } from "@/components/ShowMore";
import { getHistory, getHistoryDiff, getHistoryLog } from "@/lib/api-history";
import type { HistoryDetail } from "@/lib/types";

function fmt(t: number | null | undefined): string {
  if (!t) return "—";
  return new Date(t * 1000).toLocaleString();
}

function fmtDuration(a: number | null, b: number | null): string {
  if (!a || !b) return "—";
  const s = Math.max(0, Math.round(b - a));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

const STATUS_COLORS: Record<string, string> = {
  done: "var(--a-green)",
  failed: "var(--ao-red)",
  killed: "var(--ao-red)",
  stopped: "var(--a-yellow)",
  running: "var(--ao-red)",
  pending: "var(--secondary)",
};

const CHANGE_COLORS: Record<string, string> = {
  created: "var(--a-green)",
  modified: "var(--a-yellow)",
  deleted: "var(--ao-red)",
};

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ pid: string }>();
  const pid = params?.pid as string;

  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [diff, setDiff] = useState<string>("");
  const [log, setLog] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"diff" | "log">("diff");

  useEffect(() => {
    if (!pid) return;
    let alive = true;
    Promise.all([
      getHistory(pid),
      getHistoryDiff(pid).catch(() => ({ diff: "" })),
      getHistoryLog(pid).catch(() => ({ log: "" })),
    ])
      .then(([d, df, lg]) => {
        if (!alive) return;
        setDetail(d);
        setDiff(df.diff);
        setLog(lg.log);
      })
      .catch((e) => alive && setError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, [pid]);

  if (error) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-14">
        <button className="btn btn-ghost" onClick={() => router.back()}>
          <ArrowLeft size={12} /> Back
        </button>
        <p className="mt-6 font-mono text-[12px]" style={{ color: "var(--ao-red)" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="h-[60dvh] grid place-items-center">
        <Loader2 size={16} className="animate-spin text-(--secondary)" />
      </div>
    );
  }

  const m = detail.meta;
  const statusTone = STATUS_COLORS[m.status] || "var(--secondary)";

  function handleRerun() {
    sessionStorage.setItem("ao-rerun-terminal", m.terminal);
    sessionStorage.setItem("ao-rerun-cwd", m.cwd ?? "");
    sessionStorage.setItem("ao-rerun-title", m.title ?? "Re-run");
    router.push("/workspace");
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 md:px-8 py-8 md:py-12">
      <div className="flex items-center gap-2">
        <Link href="/history" className="btn btn-ghost">
          <ArrowLeft size={12} /> History
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRerun}
          title="Open this task in the workspace and run it again"
        >
          <Play size={12} />
          Run again
        </button>
      </div>

      {/* header */}
      <header className="mt-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--secondary)">
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: statusTone }}
          />
          {m.status}
          <span className="text-(--frost)">·</span>
          {m.id}
        </div>

        <h1
          className="font-display mt-2 text-(--primary)"
          style={{
            fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
            lineHeight: 1.2,
            fontWeight: 500,
            letterSpacing: "-0.6px",
          }}
        >
          {m.title || "Untitled"}
        </h1>

        <dl className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 font-mono text-[11px]">
          <div>
            <dt className="text-(--secondary) uppercase tracking-[0.14em] text-[9px]">
              cwd
            </dt>
            <dd className="mt-0.5 text-(--primary) break-all" dir="ltr">
              {m.cwd || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-(--secondary) uppercase tracking-[0.14em] text-[9px]">
              duration
            </dt>
            <dd className="mt-0.5 text-(--primary)">
              {fmtDuration(m.started_at, m.finished_at)}
            </dd>
          </div>
          <div>
            <dt className="text-(--secondary) uppercase tracking-[0.14em] text-[9px]">
              exit
            </dt>
            <dd className="mt-0.5 text-(--primary)">
              {m.exit_code ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-(--secondary) uppercase tracking-[0.14em] text-[9px]">
              started
            </dt>
            <dd className="mt-0.5 text-(--primary)">
              {fmt(m.started_at)}
            </dd>
          </div>
        </dl>
      </header>

      {/* changes list */}
      <section
        className="mt-8 px-4 py-4"
        style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--primary)">
            Changes · {detail.changes.length}
          </span>
        </div>
        {detail.changes.length === 0 ? (
          <p className="font-mono text-[10px] text-(--secondary)">
            — no changes detected —
          </p>
        ) : (
          <ul className="space-y-1">
            {detail.changes.map((c) => (
              <li
                key={c.path}
                className="flex items-center gap-2 font-mono text-[11px] py-1"
              >
                <span
                  className="shrink-0 text-[9px] uppercase tracking-[0.14em] w-[64px]"
                  style={{ color: CHANGE_COLORS[c.status] }}
                >
                  {c.status}
                </span>
                <span className="text-(--primary) truncate" dir="ltr">
                  {c.path}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* commands */}
      {m.terminal && (
        <section
          className="mt-4 px-4 py-4"
          style={{ borderRadius: 16, border: "1px solid var(--frost)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--primary)">
              Script
            </span>
            <CopyButton text={m.terminal} label="" />
          </div>
          <ShowMore collapsedHeight={200}>
            <pre
              dir="ltr"
              className="font-mono text-[11px] leading-[1.65] whitespace-pre-wrap break-words text-(--primary)"
            >
              <code>{m.terminal}</code>
            </pre>
          </ShowMore>
        </section>
      )}

      {/* tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-(--frost)">
        {(
          [
            ["diff", "Diff"],
            ["log", "Log"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 transition-colors"
            style={{
              color: tab === k ? "var(--ao-red)" : "var(--secondary)",
              borderBottom:
                tab === k ? "2px solid var(--ao-red)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "diff" ? (
          <DiffViewer diff={diff} />
        ) : (
          <pre
            dir="ltr"
            className="overflow-auto px-3 py-3 font-mono text-[11px] leading-[1.7] text-(--primary)"
            style={{
              background: "var(--ao-bg-surface)",
              border: "1px solid var(--frost)",
              borderRadius: 8,
              maxHeight: 640,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <code>{log || "— empty —"}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
