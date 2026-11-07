"use client";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

export function ProgressBar({
  progress,
  status,
  tasksTotal,
  tasksDone,
  className,
}: {
  progress: number;
  status: string;
  tasksTotal?: number;
  tasksDone?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.16em] text-ink-mute">
          {status}
        </span>
        <span className="text-[12px] text-ink-soft tabular-nums">
          {tasksTotal ? `${tasksDone ?? 0}/${tasksTotal} · ` : ""}
          {progress}%
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
