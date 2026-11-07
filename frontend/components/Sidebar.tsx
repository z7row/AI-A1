"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Play,
  LayoutDashboard,
  History,
  BookOpen,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Logo } from "./Logo";
import { ServerStatus } from "./ServerStatus";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/run", label: "Run", icon: Play },
  { href: "/workspace", label: "Workspace", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/prompts", label: "Prompts", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/explain", label: "Explain", icon: BookOpen },
];

export function Sidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const path = usePathname();
  const W = open ? 220 : 64;

  return (
    <motion.aside
      initial={false}
      animate={{ width: W }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 h-dvh z-40 flex flex-col overflow-hidden"
      style={{
        borderRight: "1px solid var(--frost)",
        background: "var(--ao-bg-canvas)",
      }}
    >
      <Link
        href="/"
        className="h-16 shrink-0 flex items-center gap-2 px-4"
        style={{ borderBottom: "1px solid var(--frost)" }}
      >
        <span className="shrink-0 grid place-items-center w-8 h-8 text-accent">
          <Logo size={22} />
        </span>
        {open && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[15px] font-semibold tracking-tight text-ink whitespace-nowrap"
          >
            AI<span className="text-accent"> A1</span>
          </motion.span>
        )}
      </Link>

      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? path === "/" : path.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              title={open ? undefined : l.label}
              className={cn(
                "flex items-center gap-3 h-10 rounded-lg text-[13px] transition-colors shrink-0",
                open ? "px-3" : "justify-center px-0",
                active
                  ? "bg-subtle text-ink"
                  : "text-ink-soft hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon size={16} className="shrink-0" />
              {open && <span className="whitespace-nowrap">{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className="shrink-0 flex flex-col gap-2 px-2 py-3"
        style={{ borderTop: "1px solid var(--frost)" }}
      >
        {open ? (
          <div className="flex items-center justify-between px-2">
            <ServerStatus />
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          title={open ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "flex items-center gap-3 h-10 rounded-lg text-ink-soft hover:bg-subtle hover:text-ink transition-colors shrink-0",
            open ? "px-3" : "justify-center px-0",
          )}
        >
          {open ? (
            <>
              <PanelLeftClose size={16} className="shrink-0" />
              <span className="whitespace-nowrap text-[13px]">Collapse</span>
            </>
          ) : (
            <PanelLeftOpen size={16} className="shrink-0" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
