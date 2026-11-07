"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { DangerModal } from "@/components/DangerModal";
import { DetailsModal } from "@/components/DetailsModal";
import { parseAiResponse, buildScript } from "@/lib/parseResponse";
import {
  killProcess,
  listProcesses,
  openLogSocket,
  pingServer,
  runTask,
  sendInputToSocket,
  stripAnsi,
} from "@/lib/api";
import { scanDangerous, isSensitiveCommand, type Danger } from "@/lib/dangerous";
import { setFavicon } from "@/lib/favicon";
import {
  ensureNotifyPermission,
  getBrowserEnabled,
  getSoundEnabled,
  isPageHidden,
  playDoneSound,
  setBrowserEnabled,
  showBrowserNotification,
} from "@/lib/notify";
import type { ParsedResponse } from "@/lib/types";
import { StatusStrips } from "./strips";
import { checkCommandsWhitelist } from "@/lib/whitelist";
import { useWhitelist } from "@/lib/whitelistStore";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceBody } from "./components/WorkspaceBody";

const AUTO_COPY_KEY = "ao-auto-copy";
function slug(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function WorkspacePage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedResponse | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [cwd, setCwd] = useState<string>("");
  const [taskKey, setTaskKey] = useState(0);
  const [pid, setPid] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState("");
  const [dangers, setDangers] = useState<Danger[]>([]);
  const [showDanger, setShowDanger] = useState(false);
  const [showSensitiveDanger, setShowSensitiveDanger] = useState(false);
  const [tableKey, setTableKey] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [notifyOn, setNotifyOn] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [deselectedItems, setDeselectedItems] = useState<Set<string>>(new Set());
  
  const whitelist = useWhitelist();

  const socketRef = useRef<WebSocket | null>(null);
  const statusRef = useRef(status);
  const lastAutoRanParsedRef = useRef<ParsedResponse | null>(null);
  const resizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, pct: 50 });
  const bodyRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (!menuRef.current || !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    const marker = document.createElement("div");
    marker.id = "ao-workspace-mounted";
    marker.setAttribute("aria-hidden", "true");
    marker.style.display = "none";
    document.body.appendChild(marker);
    function onMsg(e: MessageEvent) {
      if (e.source !== window) return;
      const data = e.data;
      if (!data || data.__ao_apply_response__ !== true) return;
      const text = typeof data.text === "string" ? data.text : "";
      const nextCwd = typeof data.cwd === "string" ? data.cwd : "";
      if (!text.trim()) return;
      sessionStorage.setItem("ao-response-text", text);
      sessionStorage.setItem("ao-task-cwd", nextCwd);
      setCwd(nextCwd);
      const result = parseAiResponse(text);
      if (result.ok) {
        setParsed(result.data);
        setParseError(null);
      } else {
        setParsed(null);
        setParseError(result.error);
      }
      setStatus("idle");
      setProgress(0);
      setLog("");
      setPid(null);
      lastAutoRanParsedRef.current = null;
    }
    window.addEventListener("message", onMsg);
    return () => {
      window.removeEventListener("message", onMsg);
      marker.remove();
    };
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizingRef.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaPct = (deltaX / rect.width) * 100;
      setSplitPct(
        Math.max(15, Math.min(85, dragStartRef.current.pct + deltaPct)),
      );
    }
    function onUp() {
      if (resizingRef.current) {
        resizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function onDividerDown(e: React.MouseEvent) {
    e.preventDefault();
    resizingRef.current = true;
    dragStartRef.current = { x: e.clientX, pct: splitPct };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    setAutoCopy(localStorage.getItem(AUTO_COPY_KEY) === "1");
    setNotifyOn(getBrowserEnabled());
  }, []);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2800);
  }

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      await pingServer();
      if (!alive) return;
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const rerunTerminal = sessionStorage.getItem("ao-rerun-terminal");
    const rerunCwd = sessionStorage.getItem("ao-rerun-cwd");
    const rerunTitle = sessionStorage.getItem("ao-rerun-title");
    if (rerunTerminal && rerunCwd) {
      sessionStorage.removeItem("ao-rerun-terminal");
      sessionStorage.removeItem("ao-rerun-cwd");
      sessionStorage.removeItem("ao-rerun-title");
      setCwd(rerunCwd);
      setParsed({
        title: rerunTitle ?? "Re-run",
        plan: "Re-running a previous task from history.",
        commands: rerunTerminal,
        files: [],
        patches: [],
        edits: [],
        deletions: [],
        outputNotes: [],
        warnings: [],
        raw: rerunTerminal,
      });
      setParseError(null);
      setStatus("idle");
      setProgress(0);
      setLog("");
      setPid(null);
      return;
    }
    const raw = sessionStorage.getItem("ao-response-text") ?? "";
    const dir = sessionStorage.getItem("ao-task-cwd") ?? "";
    setCwd(dir);
    const result = parseAiResponse(raw);
    if (result.ok) {
      setParsed(result.data);
      setParseError(null);
    } else {
      setParsed(null);
      setParseError(result.error);
    }
    setStatus("idle");
    setProgress(0);
    setLog("");
    setPid(null);
  }, [taskKey]);

  // Clear deselected items when a new parsed response arrives
  useEffect(() => {
    setDeselectedItems(new Set());
  }, [parsed]);

  const toggleItem = (key: string) => {
    setDeselectedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredParsed = useMemo(() => {
    if (!parsed) return null;
    const cmdLines = parsed.commands.split("\n");
    return {
      ...parsed,
      commands: cmdLines.filter((_, i) => !deselectedItems.has(`cmd:${i}`)).join("\n"),
      files: parsed.files.filter((_, i) => !deselectedItems.has(`file:${i}`)),
      edits: parsed.edits.filter((_, i) => !deselectedItems.has(`edit:${i}`)),
      patches: parsed.patches.filter((_, i) => !deselectedItems.has(`patch:${i}`)),
      deletions: parsed.deletions.filter((_, i) => !deselectedItems.has(`delete:${i}`)),
    };
  }, [parsed, deselectedItems]);

  const { safeScript, sensitiveScript, fullScript, sensitiveDangers } =
    useMemo(() => {
      if (!filteredParsed)
        return {
          safeScript: "",
          sensitiveScript: "",
          fullScript: "",
          sensitiveDangers: [] as Danger[],
        };
      const safeCommands: string[] = [];
      const sensitiveCommands: string[] = [];
      const dangers: Danger[] = [];

      for (const line of filteredParsed.commands.split("\n")) {
        if (isSensitiveCommand(line)) {
          sensitiveCommands.push(line);
          dangers.push({
            label: "Sensitive file access",
            reason:
              "This command attempts to access sensitive configuration or credentials (e.g., .env).",
            sample: line,
          });
        } else {
          safeCommands.push(line);
        }
      }

      const _safeParsed = { ...filteredParsed, commands: safeCommands.join("\n") };
      const _sensitiveParsed = {
        ...filteredParsed,
        commands: sensitiveCommands.join("\n"),
        files: [],
        patches: [],
        edits: [],
        deletions: [],
      };

      return {
        safeScript: buildScript(_safeParsed),
        sensitiveScript: sensitiveCommands.length
          ? buildScript(_sensitiveParsed)
          : "",
        fullScript: buildScript(filteredParsed),
        sensitiveDangers: dangers,
      };
    }, [filteredParsed]);

  const script = safeScript;

  useEffect(() => {
    if (status === "running" || status === "pending") setFavicon("running");
    else if (status === "done") setFavicon("done");
    else if (status === "failed") setFavicon("failed");
    else if (status === "stopped" || status === "killed") setFavicon("stopped");
    else setFavicon("idle");
  }, [status]);

  useEffect(() => {
    if (status !== "done" && status !== "failed" && status !== "killed") return;
    const success = status === "done";
    
    // Auto-send output to AI on failure
    if (!success) {
       window.dispatchEvent(new CustomEvent("ao-task-failed"));
    }

    if (getBrowserEnabled() && isPageHidden()) {
      if (getSoundEnabled()) playDoneSound(success ? "success" : "fail");
      showBrowserNotification(
        success ? "Task complete" : "Task failed",
        parsed?.title ?? "AO-AI task finished",
      );
    }
    if (success && autoCopy && log.length > 0) {
      const snapshot = stripAnsi(log);
      window.setTimeout(() => {
        navigator.clipboard
          .writeText(snapshot)
          .then(() => flashToast("Terminal output copied to clipboard"))
          .catch(() => {});
      }, 250);
    }
  }, [status, autoCopy]);

  const pendingDangers = useMemo(
    () => (script ? scanDangerous(script) : []),
    [script],
  );
  
  const fileChanges = useMemo(() => {
    if (!parsed) return [];
    const map = new Map<string, { path: string; label: string; color: string; count: number }>();
    const add = (path: string, label: string, color: string) => {
      const key = `${label}-${path}`;
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, { path, label, color, count: 1 });
      }
    };
    for (const f of parsed.files) add(f.path, "new", "var(--a-green)");
    for (const e of parsed.edits) add(e.path, "edit", "var(--a-blue)");
    for (const p of parsed.patches) add(p.path, "patch", "var(--a-yellow)");
    for (const d of parsed.deletions) add(d, "delete", "var(--ao-red)");
    return Array.from(map.values());
  }, [parsed]);

  useEffect(() => {
    if (!parsed || !whitelist.loaded || !whitelist.enabled) return;
    if (
      lastAutoRanParsedRef.current === parsed ||
      pid !== null ||
      pendingDangers.length > 0
    )
      return;
    const hasFileOps =
      parsed.files.length > 0 ||
      parsed.edits.length > 0 ||
      parsed.patches.length > 0 ||
      parsed.deletions.length > 0;
    if (hasFileOps || !parsed.commands.trim()) {
      lastAutoRanParsedRef.current = parsed;
      return;
    }
    const check = checkCommandsWhitelist(parsed.commands, whitelist.entries);
    if (!check.allAllowed) {
      lastAutoRanParsedRef.current = parsed;
      return;
    }
    lastAutoRanParsedRef.current = parsed;
    if (sensitiveDangers.length > 0) {
      flashToast("Sensitive files blocked from auto-run.");
      actuallyRun(safeScript);
    } else {
      actuallyRun(fullScript);
    }
  }, [
    parsed,
    whitelist.loaded,
    whitelist.enabled,
    whitelist.entries,
    pid,
    pendingDangers,
    sensitiveDangers,
    safeScript,
    fullScript,
  ]);

  const computedProgress = useMemo(() => {
    if (status === "done") return 100;
    if (!parsed) return 0;
    if (status === "idle" && pid === null) return 0;
    const hasCommands = !!parsed.commands.trim();
    const totalFiles =
      parsed.files.length + parsed.edits.length + parsed.patches.length;
    const commandWeight = hasCommands ? 30 : 0;
    const perFile = totalFiles > 0 ? (100 - commandWeight) / totalFiles : 0;
    const markers = (
      log.match(/\[Z7row\]\s+(?:Writing|Editing|Patching)\s+/g) || []
    ).length;
    let p =
      hasCommands && markers > 0
        ? commandWeight
        : hasCommands && status !== "idle"
          ? 6
          : 0;
    p += Math.min(markers, totalFiles) * perFile;
    if (!hasCommands && totalFiles === 0 && status !== "idle") return 90;
    return Math.min(99, Math.round(p));
  }, [log, status, parsed, pid]);

  async function reconcileStatus(id: string) {
    try {
      const p = (await listProcesses()).find((x) => x.id === id);
      if (p) {
        setStatus(p.status);
        setProgress(p.status === "done" ? 100 : (p.progress ?? 0));
        setTableKey((k) => k + 1);
      }
    } catch {}
  }

  async function actuallyRun(customScript?: string) {
    const scriptToRun = customScript || script;
    if (!parsed || !scriptToRun) return;
    try {
      setStatus("pending");
      const res = await runTask({
        title: parsed.title ?? "Untitled",
        terminal: scriptToRun,
        cwd,
      });
      setPid(res.id);
      setProgress(0);
      setLog("");
      setTableKey((k) => k + 1);
      const socket = openLogSocket(res.id, (msg) => {
        if (msg.type === "snapshot") setLog(msg.log ?? "");
        else if (msg.type === "output") setLog((prev) => prev + msg.line);
        else if (msg.type === "status") {
          setStatus(msg.status);
          setTableKey((k) => k + 1);
          if (msg.status === "done") setProgress(100);
        } else if (msg.type === "progress") setProgress(msg.progress ?? 0);
      });
      socket.addEventListener("close", () => {
        // If the server drops the socket, reconcile immediately instead of waiting
        if (statusRef.current === "running" || statusRef.current === "pending") {
          reconcileStatus(res.id);
        }
      });
      socketRef.current = socket;
      const guard = window.setInterval(() => {
        const s = statusRef.current;
        if (s === "done" || s === "failed" || s === "killed") {
          window.clearInterval(guard);
          return;
        }
        reconcileStatus(res.id);
      }, 1000); // Reduced from 2000ms to 1000ms for faster UI updates
      window.setTimeout(() => window.clearInterval(guard), 30_000);
    } catch (e) {
      setLog((p) => p + `\n[client error] ${(e as Error).message}\n`);
      setStatus("failed");
    }
  }

  async function handleAccept() {
    if (pendingDangers.length) {
      setDangers(pendingDangers);
      setShowDanger(true);
      return;
    }

    if (sensitiveDangers.length > 0) {
      flashToast("Sensitive files detected. Review the warning.");
      setShowSensitiveDanger(true);
      return;
    }
    
    // Removed ensureNotifyPermission() from here because it blocks the UI
    // The user can enable notifications from the menu instead.
    actuallyRun(fullScript);
  }

  async function handleCancel() {
    if (pid) {
      try {
        await killProcess(pid);
      } catch {}
    }
    socketRef.current?.close();
    setStatus("killed");
    setTableKey((k) => k + 1);
  }

  function handleClear() {
    setLog("");
    setProgress(0);
    setStatus("idle");
    setPid(null);
    socketRef.current?.close();
    socketRef.current = null;
  }

  function handleDownload() {
    if (!log) return;
    const blob = new Blob([log], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(parsed?.title ?? "") || "task"}-${pid ?? "log"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toggleAutoCopy() {
    const next = !autoCopy;
    setAutoCopy(next);
    if (typeof localStorage !== "undefined")
      localStorage.setItem(AUTO_COPY_KEY, next ? "1" : "0");
    flashToast(next ? "Auto-copy enabled" : "Auto-copy disabled");
  }

  async function toggleNotify() {
    if (!notifyOn) {
      const perm = await ensureNotifyPermission();
      if (perm !== "granted") {
        flashToast("Notifications blocked by the browser");
        return;
      }
    }
    const next = !notifyOn;
    setNotifyOn(next);
    setBrowserEnabled(next);
    flashToast(next ? "Notifications enabled" : "Notifications disabled");
  }

  function sendInput(data: string) {
    const s = socketRef.current;
    if (s && s.readyState === WebSocket.OPEN) sendInputToSocket(s, data);
  }

  function handleResize(rows: number, cols: number) {
    const s = socketRef.current;
    if (s && s.readyState === WebSocket.OPEN)
      try {
        s.send(JSON.stringify({ type: "resize", rows, cols }));
      } catch {}
  }

  const running = status === "running" || status === "pending";
  const statusColor =
    status === "running" || status === "pending"
      ? "var(--ao-red)"
      : status === "done"
        ? "var(--a-green)"
        : status === "failed" || status === "killed"
          ? "var(--ao-red)"
          : "var(--secondary)";

  if (parseError)
    return (
      <div className="h-dvh grid place-items-center px-6">
        <div className="max-w-md text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--ao-red)" }}>
            parse error
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-(--primary)">
            {parseError}
          </p>
          <button className="btn btn-secondary mt-6" onClick={() => router.push("/run")}>
            Back to input
          </button>
        </div>
      </div>
    );

  if (!parsed)
    return (
      <div className="h-dvh grid place-items-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--secondary)">
          loading…
        </span>
      </div>
    );

  return (
    <>
      <div className="h-dvh flex flex-col bg-(--void) text-(--primary) overflow-hidden pt-4 md:pt-6">
        <WorkspaceHeader
          parsed={parsed}
          cwd={cwd}
          running={running}
          script={script}
          handleCancel={handleCancel}
          handleAccept={handleAccept}
          setShowDetails={setShowDetails}
          router={router}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          menuRef={menuRef}
          autoCopy={autoCopy}
          toggleAutoCopy={toggleAutoCopy}
          notifyOn={notifyOn}
          toggleNotify={toggleNotify}
          log={log}
          handleDownload={handleDownload}
          handleClear={handleClear}
          setTaskKey={setTaskKey}
        />
        <StatusStrips
          pendingDangers={pendingDangers}
          sensitiveDangers={sensitiveDangers}
          script={script}
          parsed={parsed}
          status={status}
          statusColor={statusColor}
          computedProgress={computedProgress}
        />
        <WorkspaceBody
          bodyRef={bodyRef}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          splitPct={splitPct}
          onDividerDown={onDividerDown}
          log={log}
          status={status}
          sendInput={sendInput}
          handleResize={handleResize}
          parsed={parsed}
          fileChanges={fileChanges}
        />
      </div>
      <pre id="ao-terminal-output" aria-hidden="true" style={{ display: "none" }}>
        {log}
      </pre>
      <div
        id="ao-task-status"
        data-status={status}
        data-wants-output={
          parsed.outputNotes.length > 0 ||
          status === "failed" ||
          status === "killed" ||
          status === "stopped"
            ? "true"
            : "false"
        }
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <DangerModal
        open={showDanger}
        dangers={dangers}
        onCancel={() => setShowDanger(false)}
        onContinue={() => {
          setShowDanger(false);
          actuallyRun(fullScript);
        }}
      />
      <DangerModal
        open={showSensitiveDanger}
        dangers={sensitiveDangers}
        onCancel={() => {
          setShowSensitiveDanger(false);
          flashToast("Sensitive commands skipped.");
          actuallyRun(safeScript);
        }}
        onContinue={() => {
          setShowSensitiveDanger(false);
          actuallyRun(fullScript);
        }}
      />
      <DetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        parsed={parsed}
        cwd={cwd}
        deselectedItems={deselectedItems}
        toggleItem={toggleItem}
      />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-6 right-6 z-[60] px-4 h-11 inline-flex items-center gap-2 rounded-full text-[13px] font-medium"
            style={{
              background: "var(--ao-bg-subtle)",
              color: "var(--ao-text-primary)",
              border: "1px solid var(--frost)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            <span
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--a-green)" }}
            />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
