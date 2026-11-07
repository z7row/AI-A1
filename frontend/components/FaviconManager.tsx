"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setFavicon } from "@/lib/favicon";

export function FaviconManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Always reset to idle on navigation so a previous task's status
    // doesn't leak into other pages or persist forever.
    setFavicon("idle");
  }, [pathname]);

  return null;
}
