"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FileTree } from "./FileTree";
import { FileBlock, PatchBlock, EditBlock } from "@/app/workspace/panels";
import { Checkbox } from "./ui/checkbox";
import { readFile } from "@/lib/api-history";
import type { ParsedResponse } from "@/lib/types";

type Tab = "select" | "files" | "edits" | "deletions" | "commands" | "browse";

export function DetailsModal({
  open,
  onClose,
  parsed,
  cwd,
  deselectedItems,
  toggleItem,
}: {
  open: boolean;
  onClose: () => void;
  parsed: ParsedResponse;
  cwd: string;
  deselectedItems: Set<string>;
  toggleItem: (key: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("select");
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPreviewPath(null);
      setPreviewContent(null);
      setPreviewError(null);
      setTab("select");
    }
  }, [open]);

  useEffect(() => {
    if (!previewPath) {
      setPreviewContent(null);
      setPreviewError(null);
      return;
    }
    let alive = true;
    setPreviewContent(null);
    setPreviewError(null);
    readFile(previewPath)
      .then((res) => {
        if (alive) setPreviewContent(res.content);
      })
      .catch((e: Error) => {
        if (alive) setPreviewError(e.message || "read failed");
      });
    return () => {
      alive = false;
    };
  }, [previewPath]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "select", label: "Selection" },
    { id: "files", label: "Files", count: parsed.files.length },
    { id: "edits", label: "Edits", count: parsed.edits.length },
    { id: "deletions", label: "Deletions", count: parsed.deletions.length },
    { id: "commands", label: "Commands" },
    { id: "browse", label: "Browse" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="details-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] grid place-items-center px-4"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-[1000px] h-[82dvh] flex flex-col overflow-hidden"
            style={{
              background: "var(--ao-bg-surface)",
              border: "1px solid var(--frost)",
              borderRadius: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className="shrink-0 flex items-center justify-between gap-4 px-5 py-4"
              style={{ borderBottom: "1px solid var(--frost)" }}
            >
              <h2 className="text-[15px] font-medium text-(--primary)">
                Task details
              </h2>
              <button
                onClick={onClose}
                className="grid place-items-center w-8 h-8 rounded-full hover:bg-white/[0.06]"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </header>

            <div
              className="shrink-0 flex gap-1 px-4 pt-3 overflow-x-auto"
              style={{ borderBottom: "1px solid var(--frost)" }}
            >
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em] px-3 py-2 whitespace-nowrap transition-colors"
                  style={{
                    color:
                      tab === t.id ? "var(--ao-red)" : "var(--secondary)",
                    borderBottom:
                      tab === t.id
                        ? "2px solid var(--ao-red)"
                        : "2px solid transparent",
                  }}
                >
                  {t.label}
                  {t.count !== undefined ? ` · ${t.count}` : ""}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-4">
              {tab === "select" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-lg text-(--primary) mb-1">Select items to run</h3>
                    <p className="text-[12px] text-(--secondary) mb-4">Uncheck anything you don't want to execute.</p>
                  </div>
                  
                  {parsed.commands.trim() && (
                    <div>
                      <h4 className="font-mono text-[10px] uppercase text-(--secondary) mb-2 tracking-wider">Commands</h4>
                      <ul className="space-y-2">
                        {parsed.commands.split("\n").map((line, i) => {
                          if (!line.trim()) return null;
                          return (
                            <li key={`cmd-${i}`} className="flex items-start gap-3">
                              <Checkbox
                                id={`cmd-${i}`}
                                checked={!deselectedItems.has(`cmd:${i}`)}
                                onCheckedChange={() => toggleItem(`cmd:${i}`)}
                                className="mt-0.5"
                              />
                              <label htmlFor={`cmd-${i}`} className="text-[13px] font-mono text-(--primary) leading-relaxed cursor-pointer break-all">
                                {line}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {(parsed.files.length > 0 || parsed.edits.length > 0 || parsed.patches.length > 0 || parsed.deletions.length > 0) && (
                    <div>
                      <h4 className="font-mono text-[10px] uppercase text-(--secondary) mb-2 tracking-wider">Files & Changes</h4>
                      <ul className="space-y-2">
                        {parsed.files.map((f, i) => (
                          <li key={`file-${i}`} className="flex items-center gap-3">
                            <Checkbox id={`file-${i}`} checked={!deselectedItems.has(`file:${i}`)} onCheckedChange={() => toggleItem(`file:${i}`)} />
                            <label htmlFor={`file-${i}`} className="text-[13px] font-mono text-(--primary) cursor-pointer flex-1 truncate">
                              {f.path} <span className="text-[10px] text-(--a-green)">(new)</span>
                            </label>
                          </li>
                        ))}
                        {parsed.edits.map((e, i) => (
                          <li key={`edit-${i}`} className="flex items-center gap-3">
                            <Checkbox id={`edit-${i}`} checked={!deselectedItems.has(`edit:${i}`)} onCheckedChange={() => toggleItem(`edit:${i}`)} />
                            <label htmlFor={`edit-${i}`} className="text-[13px] font-mono text-(--primary) cursor-pointer flex-1 truncate">
                              {e.path} <span className="text-[10px] text-(--a-blue)">(edit)</span>
                            </label>
                          </li>
                        ))}
                        {parsed.patches.map((p, i) => (
                          <li key={`patch-${i}`} className="flex items-center gap-3">
                            <Checkbox id={`patch-${i}`} checked={!deselectedItems.has(`patch:${i}`)} onCheckedChange={() => toggleItem(`patch:${i}`)} />
                            <label htmlFor={`patch-${i}`} className="text-[13px] font-mono text-(--primary) cursor-pointer flex-1 truncate">
                              {p.path} <span className="text-[10px] text-(--a-yellow)">(patch)</span>
                            </label>
                          </li>
                        ))}
                        {parsed.deletions.map((d, i) => (
                          <li key={`delete-${i}`} className="flex items-center gap-3">
                            <Checkbox id={`delete-${i}`} checked={!deselectedItems.has(`delete:${i}`)} onCheckedChange={() => toggleItem(`delete:${i}`)} />
                            <label htmlFor={`delete-${i}`} className="text-[13px] font-mono text-(--primary) cursor-pointer flex-1 truncate">
                              {d} <span className="text-[10px] text-(--ao-red)">(delete)</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {tab === "files" &&
                (parsed.files.length === 0 ? (
                  <Empty text="No files" />
                ) : (
                  <div className="space-y-2">
                    {parsed.files.map((f) => (
                      <FileBlock key={f.path} file={f} />
                    ))}
                  </div>
                ))}

              {tab === "edits" &&
                (parsed.edits.length === 0 ? (
                  <Empty text="No edits" />
                ) : (
                  <div className="space-y-2">
                    {parsed.edits.map((e, i) => (
                      <EditBlock key={`${e.path}-${i}`} edit={e} />
                    ))}
                  </div>
                ))}

              {tab === "deletions" &&
                (parsed.deletions.length === 0 ? (
                  <Empty text="No deletions" />
                ) : (
                  <ul className="space-y-1">
                    {parsed.deletions.map((p) => (
                      <li
                        key={p}
                        className="font-mono text-[12px] px-3 h-9 flex items-center"
                        style={{
                          border: "1px solid var(--frost)",
                          borderRadius: 8,
                          color: "var(--ao-red)",
                        }}
                        dir="ltr"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === "commands" &&
                (parsed.commands.trim() === "" ? (
                  <Empty text="No commands" />
                ) : (
                  <pre
                    dir="ltr"
                    className="px-3 py-2 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap wrap-break-word text-(--primary)"
                    style={{
                      border: "1px solid var(--frost)",
                      borderRadius: 8,
                    }}
                  >
                    <code>{parsed.commands}</code>
                  </pre>
                ))}

              {tab === "browse" &&
                (!cwd ? (
                  <Empty text="No working directory set" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full min-h-0">
                    <div
                      className="p-3 overflow-auto min-h-0"
                      style={{
                        border: "1px solid var(--frost)",
                        borderRadius: 10,
                      }}
                    >
                      <FileTree root={cwd} onFileClick={setPreviewPath} />
                    </div>
                    <div
                      className="p-3 overflow-auto min-h-0"
                      style={{
                        border: "1px solid var(--frost)",
                        borderRadius: 10,
                      }}
                    >
                      {previewError ? (
                        <p
                          className="font-mono text-[12px]"
                          style={{ color: "var(--ao-red)" }}
                        >
                          {previewError}
                        </p>
                      ) : previewContent !== null ? (
                        <pre
                          dir="ltr"
                          className="font-mono text-[11.5px] leading-[1.7] whitespace-pre text-(--primary)"
                        >
                          <code>{previewContent}</code>
                        </pre>
                      ) : previewPath ? (
                        <p className="font-mono text-[11px] text-(--secondary)">
                          loading…
                        </p>
                      ) : (
                        <p className="font-mono text-[11px] text-(--secondary)">
                          Select a file to preview
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="font-mono text-[11px] text-(--secondary)">— {text} —</p>
  );
}
