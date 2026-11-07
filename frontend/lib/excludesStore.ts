"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./api";

const LS_KEY = "ao-excludes";

export const DEFAULT_EXCLUDES: string[] = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "__pycache__",
  ".venv",
  "venv",
  "env",
  ".cache",
  ".turbo",
  ".parcel-cache",
  "target",
  "coverage",
  ".idea",
  ".vscode",
  ".DS_Store",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "npm-shrinkwrap.json",
];

function readLocal(): string[] {
  if (typeof localStorage === "undefined") return [...DEFAULT_EXCLUDES];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [...DEFAULT_EXCLUDES];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      return parsed;
    }
  } catch {}
  return [...DEFAULT_EXCLUDES];
}

function writeLocal(entries: string[]) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {}
}

async function apiGet(): Promise<string[] | null> {
  try {
    const res = await fetch(`${API_BASE}/settings/excludes`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { patterns?: unknown };
    if (!Array.isArray(data.patterns)) return null;
    return data.patterns.filter((x): x is string => typeof x === "string");
  } catch {
    return null;
  }
}

async function apiSave(entries: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings/excludes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patterns: entries }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useExcludes() {
  const [entries, setEntries] = useState<string[]>(DEFAULT_EXCLUDES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const local = readLocal();
    setEntries(local);
    setLoaded(true);

    (async () => {
      const remote = await apiGet();
      if (!alive || remote === null) return;
      if (JSON.stringify(remote) !== JSON.stringify(local)) {
        writeLocal(remote);
        setEntries(remote);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const addEntry = useCallback((entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    setEntries((cur) => {
      if (cur.includes(trimmed)) return cur;
      const next = [...cur, trimmed];
      writeLocal(next);
      apiSave(next).catch(() => {});
      return next;
    });
  }, []);

  const removeEntry = useCallback((entry: string) => {
    setEntries((cur) => {
      const next = cur.filter((e) => e !== entry);
      writeLocal(next);
      apiSave(next).catch(() => {});
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const next = [...DEFAULT_EXCLUDES];
    writeLocal(next);
    setEntries(next);
    apiSave(next).catch(() => {});
  }, []);

  return { entries, loaded, addEntry, removeEntry, resetToDefaults };
}
