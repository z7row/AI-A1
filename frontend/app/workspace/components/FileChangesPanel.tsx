"use client";

export function FileChangesPanel({ fileChanges }: { fileChanges: any[] }) {
  if (fileChanges.length === 0) return null;
  return (
    <div
      className="shrink-0 max-h-[38%] overflow-y-auto px-6 md:px-8 py-3"
      style={{ borderTop: "1px solid var(--frost)" }}
    >
      <div className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-(--secondary) mb-2">
        Files · {fileChanges.length}
      </div>
      <ul className="space-y-1">
        {fileChanges.map((f: any) => (
          <li
            key={`${f.label}-${f.path}`}
            className="flex items-center gap-2 font-mono text-[11px]"
          >
            <span
              className="shrink-0 rounded-full"
              style={{ width: 5, height: 5, background: f.color }}
            />
            <span className="text-(--primary) truncate" dir="ltr">
              {f.path}
            </span>
            <span
              className="ml-auto shrink-0 text-[9px] uppercase tracking-[0.14em]"
              style={{ color: f.color }}
            >
              {f.label}
              {f.count > 1 ? ` ×${f.count}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
