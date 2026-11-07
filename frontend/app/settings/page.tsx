"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, FolderMinus, ShieldCheck } from "lucide-react";
import { fadeUp, staggerList } from "@/components/motion";

const SECTIONS: {
  href: string;
  title: string;
  desc: string;
  tag: string;
  Icon: typeof ShieldCheck;
}[] = [
  {
    href: "/settings/whitelist",
    title: "Command whitelist",
    desc:
      "Commands that can run without asking for approval. Turn the feature on or off and edit which lines are allowed.",
    tag: "safety",
    Icon: ShieldCheck,
  },
  {
    href: "/settings/excludes",
    title: "File tree excludes",
    desc:
      "Folders and files hidden from the project list prepended to the prompt. Keeps dependency and build noise out of the AI's context.",
    tag: "context",
    Icon: FolderMinus,
  },
];

export default function SettingsIndexPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerList(0.06, 0.08)}
      className="mx-auto w-full max-w-[900px] px-5 md:px-8 py-10 md:py-14"
    >
      <motion.header
        variants={fadeUp}
        className="flex items-start justify-between gap-4"
      >
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--secondary)">
            settings
          </span>
          <h1
            className="font-display mt-2 text-(--primary)"
            style={{
              fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)",
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: "-0.8px",
            }}
          >
            Settings
            <span style={{ color: "var(--ao-red)" }}>.</span>
          </h1>
          <p className="mt-3 max-w-[64ch] text-[13.5px] leading-[1.6] text-(--secondary)">
            Everything that controls how AO-AI behaves. Pick a section below.
          </p>
        </div>
        <Link href="/workspace" className="btn btn-ghost shrink-0">
          <ArrowLeft size={13} /> Back
        </Link>
      </motion.header>

      <motion.div
        variants={staggerList(0.05)}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {SECTIONS.map((s) => {
          const Icon = s.Icon;
          return (
            <motion.div key={s.href} variants={fadeUp}>
              <Link
                href={s.href}
                className="block p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderRadius: 20,
                  background: "var(--ao-bg-surface)",
                  border: "1px solid var(--frost)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="grid place-items-center w-10 h-10 rounded-full"
                    style={{
                      background: "rgba(255,26,26,0.10)",
                      color: "var(--tertiary)",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-(--secondary)">
                    {s.tag}
                  </span>
                </div>

                <h2 className="mt-4 text-[15px] font-medium text-(--primary)">
                  {s.title}
                </h2>
                <p className="mt-1.5 text-[12.5px] leading-[1.55] text-(--secondary)">
                  {s.desc}
                </p>

                <div className="mt-4 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-(--secondary)">
                  <span>open</span>
                  <ChevronRight size={13} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
