"use client";
import { useEffect, useState } from "react";
import { pingServer } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ServerStatus({ className }: { className?: string }) {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const ctrl = new AbortController();
    const tick = async () => {
      const ok = await pingServer(ctrl.signal);
      if (alive) setOnline(ok);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      alive = false;
      ctrl.abort();
      clearInterval(id);
    };
  }, []);

  const label =
    online === null ? "checking" : online ? "server online" : "server offline";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[12px] tracking-wide text-ink-soft",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online === true && "bg-green-500 ",
          online === false && "bg-ink-mute",
          online === null && "bg-ink-mute",
        )}
      />
      {label}
    </span>
  );
}
