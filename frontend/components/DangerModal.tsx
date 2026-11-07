"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import type { Danger } from "@/lib/dangerous";
import { Button } from "./ui/button";

export function DangerModal({
  open,
  dangers,
  onCancel,
  onContinue,
}: {
  open: boolean;
  dangers: Danger[];
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v: boolean) => !v && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-accent/40 bg-card p-7 shadow-[0_20px_80px_rgba(255,26,26,0.18)]">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-accent-wash p-2 text-accent">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[17px] font-semibold text-ink">
                Security warning — dangerous command detected
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] text-ink-soft">
                The terminal script contains patterns that can damage your
                machine. Review before continuing.
              </Dialog.Description>

              <ul className="mt-4 space-y-2">
                {dangers.map((d, i) => (
                  <li
                    key={i}
                    className="rounded-btn border border-line bg-subtle px-3 py-2"
                  >
                    <div className="text-[13px] font-medium text-accent">
                      {d.label}
                    </div>
                    <div className="text-[12px] text-ink-soft">{d.reason}</div>
                    <code className="mt-1 block truncate text-[11px] text-ink-mute">
                      {d.sample}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-btn p-1 text-ink-mute hover:bg-subtle hover:text-ink"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Abort — recommended
            </Button>
            <Button variant="primary" onClick={onContinue}>
              Continue at my own risk
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
