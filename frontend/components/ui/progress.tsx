"use client";
import * as React from "react";
import * as P from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
}: {
  value?: number;
  className?: string;
}) {
  return (
    <P.Root
      value={value}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-pill bg-subtle",
        className,
      )}
    >
      <P.Indicator
        className="h-full rounded-pill bg-accent transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </P.Root>
  );
}
