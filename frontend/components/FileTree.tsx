"use client";

import { useEffect, useState } from "react";
import { ChevronRight, FileText, FolderClosed, Loader2 } from "lucide-react";
import { listFiles } from "@/lib/api-history";
import type { FileEntry } from "@/lib/types";

export function FileTree({
  root,
  onFileClick,
  refreshKey = 0,
}: {
  root: string;
  onFileClick: (path: string) => void;
  refreshKey?: number;
}) {
  if (!root) {
    return (
      <p className="font-mono text-[10px] text-(--secondary)">— no cwd —</p>
    );
  }
  return (
    <div dir="ltr" className="font-mono text-[11px]">
      <TreeRoot
        key={`${root}-${refreshKey}`}
        root={root}
        onFileClick={onFileClick}
      />
    </div>
  );
}

function TreeRoot({
  root,
  onFileClick,
}: {
  root: string;
  onFileClick: (path: string) => void;
}) {
  const [entries, setEntries] = useState<FileEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    listFiles(root)
      .then((d) => alive && setEntries(d.entries))
      .catch(() => alive && setEntries([]));
    return () => {
      alive = false;
    };
  }, [root]);

  if (entries === null) {
    return (
      <div className="flex items-center gap-2 py-1 text-(--secondary)">
        <Loader2 size={11} className="animate-spin" />
        loading…
      </div>
    );
  }
  if (entries.length === 0) {
    return <p className="py-1 text-(--secondary)">empty</p>;
  }

  return (
    <ul>
      {entries.map((e) => (
        <TreeNode key={e.path} entry={e} level={0} onFileClick={onFileClick} />
      ))}
    </ul>
  );
}

function TreeNode({
  entry,
  level,
  onFileClick,
}: {
  entry: FileEntry;
  level: number;
  onFileClick: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [kids, setKids] = useState<FileEntry[] | null>(null);

  function toggle() {
    if (!entry.dir) {
      onFileClick(entry.path);
      return;
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open || !entry.dir) return;
    if (kids !== null) return;
    let alive = true;
    listFiles(entry.path)
      .then((d) => alive && setKids(d.entries))
      .catch(() => alive && setKids([]));
    return () => {
      alive = false;
    };
  }, [open, entry.dir, entry.path, kids]);

  const indent = 6 + level * 12;

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-1.5 py-1 pr-1 text-left hover:bg-white/3 transition-colors duration-150"
        style={{ paddingLeft: indent }}
      >
        {entry.dir ? (
          <>
            <ChevronRight
              size={11}
              className="shrink-0 transition-transform duration-150"
              style={{
                color: "var(--secondary)",
                transform: open ? "rotate(90deg)" : "none",
              }}
            />
            <FolderClosed
              size={11}
              className="shrink-0"
              style={{ color: "var(--a-yellow)" }}
            />
          </>
        ) : (
          <>
            <span style={{ width: 11 }} />
            <FileText
              size={11}
              className="shrink-0"
              style={{ color: "var(--secondary)" }}
            />
          </>
        )}
        <span className="truncate text-(--primary)">{entry.name}</span>
      </button>
      {entry.dir && open && (
        <ul>
          {kids === null ? (
            <li
              className="py-1 text-[10px] text-(--secondary) flex items-center gap-1.5"
              style={{ paddingLeft: indent + 14 }}
            >
              <Loader2 size={10} className="animate-spin" /> loading…
            </li>
          ) : kids.length === 0 ? (
            <li
              className="py-1 text-[10px] text-(--secondary)"
              style={{ paddingLeft: indent + 14 }}
            >
              empty
            </li>
          ) : (
            kids.map((k) => (
              <TreeNode
                key={k.path}
                entry={k}
                level={level + 1}
                onFileClick={onFileClick}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}
