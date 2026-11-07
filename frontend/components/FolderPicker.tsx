"use client";
import { useEffect, useState } from "react";
import { ChevronRight, Folder, Home, X, Terminal } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getBackendCwd } from "@/lib/api";
type BrowseResp = {
  path: string;
  parent: string | null;
  home: string;
  dirs: { name: string; path: string }[];
};

export function FolderPicker({
  open,
  initial,
  onCancel,
  onPick,
}: {
  open: boolean;
  initial?: string | null;
  onCancel: () => void;
  onPick: (path: string) => void;
}) {
  const [data, setData] = useState<BrowseResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pathInput, setPathInput] = useState("");

  async function load(path?: string) {
    setErr(null);
    try {
      const res = await fetch(
        `${API_BASE}/browse${path ? `?path=${encodeURIComponent(path)}` : ""}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `${res.status}`);
      }
      const json = (await res.json()) as BrowseResp;
      setData(json);
      setSelected(json.path);
      setPathInput(json.path);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  const [terminalCwd, setTerminalCwd] = useState<string | null>(null);

  useEffect(() => {
    if (open) getBackendCwd().then(setTerminalCwd);
  }, [open]);

  useEffect(() => {
    if (open) load(initial ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(v: boolean) => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(620px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-card p-6">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-[15px] font-semibold text-ink">
              Choose working directory
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-btn p-1 text-ink-mute hover:bg-subtle hover:text-ink">
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load(data?.home)}
              disabled={!data}
            >
              <Home size={14} /> Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => data?.parent && load(data.parent)}
              disabled={!data?.parent}
            >
              ↑ Parent
            </Button>
            {terminalCwd && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => load(terminalCwd)}
                title={terminalCwd}
              >
                <Terminal size={14} /> Terminal dir
              </Button>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const p = pathInput.trim();
                  if (p) load(p);
                }
              }}
              placeholder="Paste a path and press Enter"
              className="flex-1 truncate rounded-btn border border-line bg-[#0d0d0d] px-3 py-2 font-mono text-[12px] text-ink-soft outline-none focus:border-accent"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => {
                const p = pathInput.trim();
                if (p) load(p);
              }}
              className="rounded-btn border border-line px-3 py-2 text-[12px] text-ink hover:bg-subtle"
            >
              Go
            </button>
          </div>

          {err && (
            <div className="mt-3 rounded-btn border border-accent/40 bg-accent-wash px-3 py-2 text-[12px] text-accent">
              {err}
            </div>
          )}

          <ul className="mt-3 max-h-[320px] overflow-auto rounded-btn border border-line bg-[#0d0d0d]">
            {data?.dirs.length === 0 && (
              <li className="px-3 py-6 text-center text-[12px] text-ink-mute">
                No subdirectories.
              </li>
            )}
            {data?.dirs.map((d) => (
              <li key={d.path}>
                <button
                  type="button"
                  onClick={() => load(d.path)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-soft hover:bg-subtle hover:text-ink",
                    selected === d.path && "bg-subtle text-ink",
                  )}
                >
                  <Folder size={14} className="text-accent" />
                  <span className="flex-1 truncate">{d.name}</span>
                  <ChevronRight size={14} className="text-ink-mute" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!data}
              onClick={() => data && onPick(data.path)}
            >
              Use this folder
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
