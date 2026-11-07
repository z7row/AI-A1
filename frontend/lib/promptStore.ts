"use client";

import { useCallback, useEffect, useState } from "react";
import { FIRST_PROMPT, CUSTOM_PROMPT } from "./prompts";
import { API_BASE } from "./api";

export type PromptId = "first" | "custom";

const DEFAULTS: Record<PromptId, string> = {
  first: FIRST_PROMPT,
  custom: CUSTOM_PROMPT,
};

// localStorage keys (browser cache — instant, offline-friendly)
const LS_KEYS: Record<PromptId, { custom: string; active: string }> = {
  first: {
    custom: "ao-prompt-first-custom",
    active: "ao-prompt-first-active",
  },
  custom: {
    custom: "ao-prompt-custom-custom",
    active: "ao-prompt-custom-active",
  },
};

type Active = "custom" | "default";

type PromptState = {
  custom: string | undefined;
  active: Active;
};

function readLocal(id: PromptId): PromptState {
  if (typeof localStorage === "undefined") {
    return { custom: undefined, active: "default" };
  }
  const k = LS_KEYS[id];
  const custom = localStorage.getItem(k.custom) ?? undefined;
  const activeRaw = localStorage.getItem(k.active);
  const active: Active =
    activeRaw === "custom" || activeRaw === "default"
      ? activeRaw
      : custom
        ? "custom"
        : "default";
  return { custom, active };
}

function writeLocal(id: PromptId, patch: Partial<PromptState>) {
  if (typeof localStorage === "undefined") return;
  const k = LS_KEYS[id];
  if ("custom" in patch) {
    if (patch.custom === undefined) localStorage.removeItem(k.custom);
    else localStorage.setItem(k.custom, patch.custom);
  }
  if ("active" in patch && patch.active) {
    localStorage.setItem(k.active, patch.active);
  }
}

async function apiGet(id: PromptId): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/prompts/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text: string | null };
    return data.text ?? null;
  } catch {
    return null;
  }
}

async function apiSave(id: PromptId, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/prompts/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiDelete(id: PromptId): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/prompts/${id}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function usePrompt(id: PromptId) {
  const [state, setState] = useState<PromptState>({
    custom: undefined,
    active: "default",
  });
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // On mount: read localStorage instantly, then try to reconcile with
  // the backend (which is the source of truth for persistence).
  useEffect(() => {
    let alive = true;
    const local = readLocal(id);
    setState(local);
    setLoaded(true);

    (async () => {
      const remote = await apiGet(id);
      if (!alive) return;
      if (remote === null) {
        // No backend copy yet. If we have a local custom, push it up so
        // switching browsers/computers keeps the prompt.
        if (local.custom) {
          apiSave(id, local.custom).catch(() => {});
        }
        return;
      }
      // Backend has content — it wins. Cache it locally too.
      if (remote !== local.custom) {
        writeLocal(id, { custom: remote });
        setState((s) => ({ ...s, custom: remote }));
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const defaultValue = DEFAULTS[id];
  const custom = state.custom ?? defaultValue;
  const value = state.active === "custom" ? custom : defaultValue;
  const isCustom = state.active === "custom";
  const hasCustom = state.custom !== undefined;

  const saveCustom = useCallback(
    (v: string) => {
      // Instant feedback — write local first.
      writeLocal(id, { custom: v, active: "custom" });
      setState({ custom: v, active: "custom" });

      // Then persist to backend. If it fails, local copy still works.
      setSyncing(true);
      apiSave(id, v).finally(() => setSyncing(false));
    },
    [id],
  );

  const useCustom = useCallback(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_KEYS[id].active, "custom");
    setState((s) => ({ ...s, active: "custom" }));
  }, [id]);

  const useDefault = useCallback(() => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_KEYS[id].active, "default");
    setState((s) => ({ ...s, active: "default" }));
  }, [id]);

  const deleteCustom = useCallback(() => {
    // Remove locally + on the server.
    writeLocal(id, { custom: undefined, active: "default" });
    setState({ custom: undefined, active: "default" });

    setSyncing(true);
    apiDelete(id).finally(() => setSyncing(false));
  }, [id]);

  return {
    loaded,
    syncing,
    value,
    defaultValue,
    custom,
    hasCustom,
    isCustom,
    saveCustom,
    useCustom,
    useDefault,
    deleteCustom,
  };
}

export function useFirstPrompt() {
  return usePrompt("first");
}
export function useCustomPrompt() {
  return usePrompt("custom");
}