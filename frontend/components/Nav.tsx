"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ServerStatus } from "./ServerStatus";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { setFavicon } from "@/lib/favicon";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/run", label: "Run" },
  { href: "/workspace", label: "Workspace" },
  { href: "/history", label: "History" },
  { href: "/prompts", label: "Prompts" },
  { href: "/settings", label: "Settings" },
  { href: "/explain", label: "Explain" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lastY, setLastY] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    setFavicon("idle");
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const diff = y - lastY;
    if (diff < -4) {
      setVisible(true);
    } else if (diff > 4) {
      setVisible(false);
    }
    setLastY(y);
  });

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -80 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-40 border-b border-line/60 bg-canvas/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-accent">
          <Logo size={22} />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            AI<span className="text-accent"> A1</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <motion.div
              key={l.href}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                href={l.href}
                className={cn(
                  "rounded-btn px-3 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-subtle hover:text-ink",
                  (l.href === "/" ? path === "/" : path.startsWith(l.href)) &&
                    "text-ink",
                )}
              >
                {l.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ServerStatus />
          <ThemeToggle />
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-btn p-2 text-ink-soft hover:bg-subtle hover:text-ink transition-colors"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden overflow-hidden border-t border-line/60"
          >
            <div className="mx-auto max-w-[1200px] px-4 py-3 flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.25 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-btn px-3 py-2 text-[14px] text-ink-soft hover:bg-subtle hover:text-ink transition-colors",
                      (l.href === "/"
                        ? path === "/"
                        : path.startsWith(l.href)) && "text-ink bg-subtle",
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
