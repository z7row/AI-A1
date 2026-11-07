"use client";

import {
  BadgePlus,
  Bell,
  ClipboardCheck,
  Download,
  Eraser,
  Settings,
} from "lucide-react";
import { canNotify } from "@/lib/notify";

export function WorkspaceMenu({
  autoCopy,
  toggleAutoCopy,
  notifyOn,
  toggleNotify,
  log,
  handleDownload,
  handleClear,
  router,
  setMenuOpen,
}: any) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-full mt-2 z-50 min-w-[220px] py-1.5 rounded-xl overflow-hidden"
      style={{
        background: "var(--ao-bg-subtle)",
        border: "1px solid var(--frost)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
      }}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setMenuOpen(false);
          router.push("/settings");
        }}
        className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] text-(--primary) hover:bg-white/6 transition-colors"
      >
        <Settings size={13} />
        <span>Settings</span>
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setMenuOpen(false);
          router.push("/run");
        }}
        className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] text-(--primary) hover:bg-white/6 transition-colors"
      >
        <BadgePlus size={13} />
        <span>New</span>
      </button>
      <div className="my-1" style={{ borderTop: "1px solid var(--frost)" }} />
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={autoCopy}
        onClick={toggleAutoCopy}
        className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] hover:bg-white/6 transition-colors"
        style={{
          color: autoCopy ? "var(--a-green)" : "var(--ao-text-primary)",
        }}
      >
        <ClipboardCheck size={13} />
        <span>Auto-copy</span>
        <span
          className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.14em]"
          style={{ color: autoCopy ? "var(--a-green)" : "var(--secondary)" }}
        >
          {autoCopy ? "on" : "off"}
        </span>
      </button>
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={notifyOn && canNotify()}
        onClick={toggleNotify}
        className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] hover:bg-white/6 transition-colors"
        style={{
          color:
            notifyOn && canNotify()
              ? "var(--a-green)"
              : "var(--ao-text-primary)",
        }}
      >
        <Bell size={13} />
        <span>Notify</span>
        <span
          className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.14em]"
          style={{
            color:
              notifyOn && canNotify() ? "var(--a-green)" : "var(--secondary)",
          }}
        >
          {notifyOn && canNotify() ? "on" : "off"}
        </span>
      </button>
      {log && (
        <>
          <div
            className="my-1"
            style={{ borderTop: "1px solid var(--frost)" }}
          />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              handleDownload();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] text-(--primary) hover:bg-white/6 transition-colors"
          >
            <Download size={13} />
            <span>Download log</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              handleClear();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 h-9 text-[12.5px] text-(--primary) hover:bg-white/6 transition-colors"
          >
            <Eraser size={13} />
            <span>Clear log</span>
          </button>
        </>
      )}
    </div>
  );
}
