"use client";

import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "./api";
import { WHITELIST_PRESETS } from "./whitelist";

const LS_KEY = "ao-whitelist";
const LS_ENABLED_KEY = "ao-whitelist-enabled";

export const DEFAULT_WHITELIST: string[] = WHITELIST_PRESETS.flatMap(
  (g) => g.entries,
);

type State = { entries: string[]; enabled: boolean };

function readLocal(): State {
  if (typeof localStorage === "undefined") {
    return { entries: [...DEFAULT_WHITELIST], enabled: true };
  }
  let entries = [...DEFAULT_WHITELIST];
  let enabled = true;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        entries = parsed;
      }
    }
  } catch {}
  try {
    const e = localStorage.getItem(LS_ENABLED_KEY);
    if (e === "0") enabled = false;
    else if (e === "1") enabled = true;
  } catch {}
  return { entries, enabled };
}

function writeLocal(state: State) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state.entries));
    localStorage.setItem(LS_ENABLED_KEY, state.enabled ? "1" : "0");
  } catch {}
}

type Remote = { entries: string[]; enabled?: boolean };

async function apiGet(): Promise<Remote | null> {
  try {
    const res = await fetch(`${API_BASE}/settings/whitelist`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      entries?: unknown;
      enabled?: unknown;
    };
    if (!Array.isArray(data.entries)) return null;
    const entries = data.entries.filter(
      (x): x is string => typeof x === "string",
    );
    const result: Remote = { entries };
    if (typeof data.enabled === "boolean") result.enabled = data.enabled;
    return result;
  } catch {
    return null;
  }
}

async function apiSave(state: State): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings/whitelist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useWhitelist() {
  const [entries, setEntries] = useState<string[]>(DEFAULT_WHITELIST);
  const [enabled, setEnabledState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    const local = readLocal();
    setEntries(local.entries);
    setEnabledState(local.enabled);
    setLoaded(true);

    (async () => {
      const remote = await apiGet();
      if (!alive || remote === null) return;

      // The `enabled` flag is only trusted when the backend explicitly
      // sent it. Older backend versions don't store `enabled` at all, so
      // trusting a default of `true` would flip the user's OFF back to
      // ON after every reload.
      const nextEntries = remote.entries;
      const nextEnabled =
        typeof remote.enabled === "boolean" ? remote.enabled : local.enabled;

      if (
        JSON.stringify(nextEntries) !== JSON.stringify(local.entries) ||
        nextEnabled !== local.enabled
      ) {
        writeLocal({ entries: nextEntries, enabled: nextEnabled });
        setEntries(nextEntries);
        setEnabledState(nextEnabled);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: State) => {
    writeLocal(next);
    setEntries(next.entries);
    setEnabledState(next.enabled);
    apiSave(next).catch(() => {});
  }, []);

  const addEntry = useCallback(
    (entry: string) => {
      const trimmed = entry.trim();
      if (!trimmed) return;
      setEntries((current) => {
        if (current.includes(trimmed)) return current;
        const next = [...current, trimmed];
        writeLocal({ entries: next, enabled });
        apiSave({ entries: next, enabled }).catch(() => {});
        return next;
      });
    },
    [enabled],
  );

  const removeEntry = useCallback(
    (entry: string) => {
      setEntries((current) => {
        const next = current.filter((e) => e !== entry);
        writeLocal({ entries: next, enabled });
        apiSave({ entries: next, enabled }).catch(() => {});
        return next;
      });
    },
    [enabled],
  );

  const resetToDefaults = useCallback(() => {
    persist({ entries: [...DEFAULT_WHITELIST], enabled });
  }, [persist, enabled]);

  const setEnabled = useCallback(
    (value: boolean) => {
      persist({ entries, enabled: value });
    },
    [persist, entries],
  );

  return {
    entries,
    enabled,
    loaded,
    addEntry,
    removeEntry,
    resetToDefaults,
    setEnabled,
  };
}
