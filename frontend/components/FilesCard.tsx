"use client";
import { useMemo, useState } from "react";
import { ChevronDown, FileCode2 } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/card";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";
import type { ParsedFile } from "@/lib/types";

function FileEntry({ file }: { file: ParsedFile }) {
  const [open, setOpen] = useState(true);
  const lines = useMemo(() => file.content.split("\n").length, [file.content]);

  return (
    <div className="rounded-btn border border-line bg-[#0b0b0b]">
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-ink-mute transition-transform",
              !open && "-rotate-90",
            )}
          />
          <FileCode2 size={14} className="shrink-0 text-accent" />
          <span className="truncate font-mono text-[12.5px] text-ink">
            {file.path}
          </span>
          {file.lang && (
            <span className="rounded-badge border border-line bg-subtle px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-mute">
              {file.lang}
            </span>
          )}
          <span className="ml-auto shrink-0 text-[11px] text-ink-mute">
            {lines} line{lines === 1 ? "" : "s"}
          </span>
        </button>
        <CopyButton text={file.content} label="" />
      </div>

      {open && (
        <pre className="max-h-[420px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-snow whitespace-pre">
          <code>{file.content}</code>
        </pre>
      )}
    </div>
  );
}

export function FilesCard({ files }: { files: ParsedFile[] }) {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Files <span className="text-ink-mute">({files.length})</span>
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-3">
        {files.map((f) => (
          <FileEntry key={f.path} file={f} />
        ))}
      </CardBody>
    </Card>
  );
}
