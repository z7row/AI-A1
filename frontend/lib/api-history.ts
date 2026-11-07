// Extended API client for file-tree + history endpoints.

import type {
  FilesListing,
  HistoryDetail,
  HistoryMeta,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:2030";

// ── file tree ────────────────────────────────────────────────
export async function listFiles(path: string): Promise<FilesListing> {
  const r = await fetch(`${API_BASE}/files?path=${encodeURIComponent(path)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function readFile(
  path: string,
): Promise<{ path: string; content: string; size: number }> {
  const r = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── history ──────────────────────────────────────────────────
export async function listHistory(): Promise<HistoryMeta[]> {
  const r = await fetch(`${API_BASE}/history`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getHistory(pid: string): Promise<HistoryDetail> {
  const r = await fetch(`${API_BASE}/history/${pid}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getHistoryDiff(pid: string): Promise<{ diff: string }> {
  const r = await fetch(`${API_BASE}/history/${pid}/diff`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getHistoryLog(pid: string): Promise<{ log: string }> {
  const r = await fetch(`${API_BASE}/history/${pid}/log`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteHistory(pid: string): Promise<{ ok: boolean }> {
  const r = await fetch(`${API_BASE}/history/${pid}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}