"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X, AlertTriangle } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { readFile } from "@/lib/api-history";

export function FilePreview({
  path,
  onClose,
}: {
  path: string | null;
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    setContent(null);
    setError(null);
    let alive = true;
    readFile(path)
      .then((d) => alive && setContent(d.content))
      .catch((e) => alive && setError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, [path]);

  return (
    <Dialog.Root open={!!path} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(900px,94vw)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 rounded-card border border-accent/40 bg-card p-5 shadow-[0_20px_80px_rgba(255,26,26,0.18)] flex flex-col">
          <div className="flex items-start justify-between gap-3 shrink-0">
            <Dialog.Title
              className="font-mono text-[12px] text-ink truncate"
              dir="ltr"
            >
              {path ?? ""}
            </Dialog.Title>
            <div className="flex items-center gap-1 shrink-0">
              {content !== null && <CopyButton text={content} label="" />}
              <Dialog.Close asChild>
                <button
                  className="rounded-btn p-1 text-ink-mute hover:bg-subtle hover:text-ink"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="mt-3 flex-1 min-h-0 overflow-auto">
            {error ? (
              <div className="flex items-start gap-2 text-[12px] text-accent">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span dir="ltr">{error}</span>
              </div>
            ) : content === null ? (
              <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                <Loader2 size={14} className="animate-spin" />
                loading…
              </div>
            ) : (
              <pre
                dir="ltr"
                className="font-mono text-[11.5px] leading-[1.65] whitespace-pre text-ink"
              >
                <code>{content}</code>
              </pre>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
