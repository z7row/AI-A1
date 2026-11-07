"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPaste, Loader2, AlertTriangle } from "lucide-react";
import { quickstart } from "@/lib/quickstart";

export function QuickStartButton({
  label = "Paste & go",
  className = "btn btn-primary",
  iconSize = 13,
  onSuccess,
}: {
  label?: string;
  className?: string;
  iconSize?: number;
  /** If provided, replaces the default navigation after a successful read. */
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "reading" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (state === "reading") return;
    setState("reading");
    setErr(null);

    const r = await quickstart();

    if (!r.ok) {
      setState("error");
      setErr(r.error);
      window.setTimeout(() => setState("idle"), 3000);
      return;
    }

    setState("idle");
    if (onSuccess) onSuccess();
    else router.push("/workspace");
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={state === "reading"}
      className={className}
      title={err ?? label}
      aria-live="polite"
    >
      {state === "reading" ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : state === "error" ? (
        <AlertTriangle size={iconSize} />
      ) : (
        <ClipboardPaste size={iconSize} />
      )}
      <span className="hidden sm:inline">
        {state === "error" ? "Failed" : label}
      </span>
    </button>
  );
}