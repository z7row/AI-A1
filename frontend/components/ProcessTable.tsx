"use client";
import { useEffect, useState } from "react";
import { listProcesses } from "@/lib/api";
import type { ProcessInfo } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

export function ProcessTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<ProcessInfo[]>([]);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const data = await listProcesses();
        if (alive) setRows(data);
      } catch {
        /* server offline */
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [refreshKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processes</CardTitle>
        <span className="text-[12px] text-ink-mute">{rows.length} total</span>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-1.5 text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.14em] text-ink-mute">
                <th className="font-normal px-3 py-1">ID</th>
                <th className="font-normal px-3 py-1">Title</th>
                <th className="font-normal px-3 py-1">Status</th>
                <th className="font-normal px-3 py-1">Progress</th>
                <th className="font-normal px-3 py-1">Exit</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-4 text-center text-ink-mute"
                  >
                    No processes yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="bg-subtle/60">
                  <td className="rounded-l-btn px-3 py-2 font-mono text-[12px] text-ink-soft">
                    {r.id}
                  </td>
                  <td className="px-3 py-2 text-ink">{r.title}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[12px]",
                        r.status === "running" && "text-accent",
                        r.status === "done" && "text-snow",
                        r.status === "failed" && "text-accent",
                        r.status === "killed" && "text-ink-mute",
                        r.status === "pending" && "text-ink-soft",
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-soft tabular-nums">
                    {r.progress}%
                  </td>
                  <td className="rounded-r-btn px-3 py-2 text-ink-soft tabular-nums">
                    {r.exit_code ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
