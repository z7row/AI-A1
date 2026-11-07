"use client";

import { motion } from "framer-motion";
import { staggerItem } from "@/components/FadeIn";
import { CopyButton } from "@/components/CopyButton";

export function SidePanel({ title, copyText, children }: { title: React.ReactNode; copyText?: string; children: React.ReactNode }) {
  return (
    <motion.section variants={staggerItem} className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--frost)" }}>
      <header className="flex items-center justify-between gap-2 mb-2.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--primary)">{title}</span>
        {copyText && <CopyButton text={copyText} label="" iconOnly />}
      </header>
      {children}
    </motion.section>
  );
}
