import type { ProcessInfo, TaskJson } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:2030";

export const WS_BASE = API_BASE.replace(/^http/, "ws");

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && typeof data.detail === "string") {
        message = data.detail;
      } else if (data && typeof data.message === "string") {
        message = data.message;
      } else if (data && typeof data.error === "string") {
        message = data.error;
      }
    } catch {
      // Body is not JSON — keep the default status message.
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function pingServer(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/`, { signal, cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runTask(payload: {
  title: string;
  terminal: string;
  cwd?: string | null;
}) {
  const res = await fetch(`${API_BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return j<{ id: string; status: string }>(res);
}

export async function listProcesses() {
  const res = await fetch(`${API_BASE}/processes`, { cache: "no-store" });
  return j<ProcessInfo[]>(res);
}

export async function getProgress(id: string) {
  const res = await fetch(`${API_BASE}/progress/${id}`, { cache: "no-store" });
  return j<{
    id: string;
    status: string;
    progress: number;
    tasks_total: number;
    tasks_done: number;
  }>(res);
}

export async function killProcess(id: string) {
  const res = await fetch(`${API_BASE}/kill/${id}`, { method: "POST" });
  return j<{ ok: boolean; id: string; status: string }>(res);
}

export function openLogSocket(
  id: string,
  onMessage: (msg: any) => void,
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/${id}`);
  ws.onmessage = (ev) => {
    try {
      onMessage(JSON.parse(ev.data));
    } catch {
      /* ignore malformed frames */
    }
  };
  return ws;
}

// ---------------------------------------------------------------- JSON parsing

/** Strip ```json ... ``` fences if the AI wrapped the object. */
function stripFences(s: string): string {
  const trimmed = s.trim();
  const m = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return m ? m[1] : trimmed;
}

/**
 * Repair common AI-generated JSON mistakes inside string values:
 *   - literal newlines → \n
 *   - literal tabs → \t
 *   - unescaped double quotes → \"
 *   - trailing commas before } or ]
 */
function repairJson(raw: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];

    if (!inString) {
      if (c === '"') {
        inString = true;
      }
      out += c;
      continue;
    }

    // Inside a string
    if (escaped) {
      out += c;
      escaped = false;
      continue;
    }
    if (c === "\\") {
      out += c;
      escaped = true;
      continue;
    }
    if (c === "\n") {
      out += "\\n";
      continue;
    }
    if (c === "\r") {
      out += "\\r";
      continue;
    }
    if (c === "\t") {
      out += "\\t";
      continue;
    }

    if (c === '"') {
      // Lookahead: is this the closing quote of the string, or a literal quote inside it?
      let k = i + 1;
      while (k < raw.length && /\s/.test(raw[k])) k++;
      const next = raw[k];
      if (
        next === undefined ||
        next === "," ||
        next === "}" ||
        next === "]" ||
        next === ":"
      ) {
        // Real closing quote
        out += c;
        inString = false;
        continue;
      }
      // Literal quote inside the value
      out += '\\"';
      continue;
    }

    out += c;
  }

  // Remove trailing commas before } or ]
  out = out.replace(/,(\s*[}\]])/g, "$1");
  return out;
}

function tryParse(
  s: string,
): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(s) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function validate(
  data: unknown,
): { ok: true; data: TaskJson } | { ok: false; error: string } {
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "JSON root must be an object." };
  }
  const obj = data as Record<string, unknown>;
  if (typeof obj.messages !== "string") {
    return { ok: false, error: 'Field "messages" is missing or not a string.' };
  }
  if (typeof obj.terminal !== "string") {
    return { ok: false, error: 'Field "terminal" is missing or not a string.' };
  }
  return {
    ok: true,
    data: {
      title: typeof obj.title === "string" ? obj.title : undefined,
      messages: obj.messages,
      terminal: obj.terminal,
    },
  };
}

export function parseTaskJson(
  raw: string,
):
  | { ok: true; data: TaskJson; repaired: boolean }
  | { ok: false; error: string } {
  const cleaned = stripFences(raw);

  // 1) Try strict parse
  const direct = tryParse(cleaned);
  if (direct.ok) {
    const v = validate(direct.data);
    return v.ok ? { ok: true, data: v.data, repaired: false } : v;
  }

  // 2) Try repaired parse
  const repaired = tryParse(repairJson(cleaned));
  if (repaired.ok) {
    const v = validate(repaired.data);
    return v.ok ? { ok: true, data: v.data, repaired: true } : v;
  }

  return { ok: false, error: `Invalid JSON: ${direct.error}` };
}

export function sendInputToSocket(ws: WebSocket | null, data: string) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "input", data }));
}
export async function getBackendCwd(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/cwd`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { cwd: string };
    return data.cwd;
  } catch {
    return null;
  }
}

export async function getFileTree(
  cwd: string,
  exclude: string[],
): Promise<{
  path: string;
  tree: string;
  count: number;
  truncated: boolean;
}> {
  const params = new URLSearchParams();
  params.set("path", cwd);
  if (exclude.length) params.set("exclude", exclude.join(","));
  const res = await fetch(`${API_BASE}/files/tree?${params.toString()}`, {
    cache: "no-store",
  });
  return j(res);
}

export function sendResizeToSocket(
  ws: WebSocket | null,
  rows: number,
  cols: number,
) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "resize", rows, cols }));
}

/** Strip ANSI escape sequences for display. */
export function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "");
}
