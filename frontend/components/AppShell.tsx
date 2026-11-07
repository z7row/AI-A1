"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

const APP_PATHS = ["/run", "/workspace", "/prompts", "/settings"];
const KEY = "ao-sidebar-open";
const COLLAPSED = 64;
const EXPANDED = 220;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isApp = APP_PATHS.some(
    (p) => path === p || path.startsWith(p + "/"),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    setOpen(localStorage.getItem(KEY) === "1");
  }, []);

  function toggle() {
    const n = !open;
    setOpen(n);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(KEY, n ? "1" : "0");
    }
  }

  if (isApp) {
    return (
      <>
        <Sidebar open={open} onToggle={toggle} />
        <main
          style={{
            marginLeft: open ? EXPANDED : COLLAPSED,
            transition:
              "margin-left 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {children}
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-300 px-6 pt-16">{children}</main>
      <Footer />
    </>
  );
}
