import { getBackendCwd } from "./api";

const CWD_KEY = "ao-cwd";

export type QuickstartResult =
  | { ok: true }
  | { ok: false; error: string };

export async function quickstart(): Promise<QuickstartResult> {
  let text: string;
  try {
    text = await navigator.clipboard.readText();
  } catch {
    return {
      ok: false,
      error: "Clipboard permission denied — allow access and retry.",
    };
  }

  if (!text.trim()) {
    return { ok: false, error: "Clipboard is empty." };
  }

  // No content validation — the workspace parses and shows a clear
  // "parse error" if the text doesn't match any known shape.

  let cwd = localStorage.getItem(CWD_KEY) ?? "";
  if (!cwd) {
    try {
      cwd = (await getBackendCwd()) ?? "";
    } catch {
      /* backend offline — leave empty */
    }
  }

  if (!cwd) {
    return {
      ok: false,
      error: "No working directory set. Open /run and pick one first.",
    };
  }

  sessionStorage.setItem("ao-response-text", text);
  sessionStorage.setItem("ao-task-cwd", cwd);
  return { ok: true };
}
