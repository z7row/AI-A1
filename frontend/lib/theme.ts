export type ThemeState = "idle" | "running" | "success" | "error";

export function applyTheme(state: ThemeState) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", state);
}

export function clearTheme() {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute("data-theme");
}

export function mapStatus(status: string): ThemeState {
  if (status === "running" || status === "pending") return "running";
  if (status === "done") return "success";
  if (status === "failed" || status === "killed") return "error";
  return "idle";
}
