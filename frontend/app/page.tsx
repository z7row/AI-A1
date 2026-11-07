"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Play,
  ScanLine,
  Terminal,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { QuickStartButton } from "@/components/QuickStartButton";
import { fadeUp, staggerList } from "@/components/motion";

const MOVES = [
  {
    n: "01",
    color: "var(--tertiary)",
    tint: "rgba(255,26,26,0.10)",
    title: "Paste",
    body: "Drop the model's Markdown — headers, setup commands, fenced files.",
    icon: Terminal,
  },
  {
    n: "02",
    color: "var(--a-blue)",
    tint: "rgba(59,158,255,0.10)",
    title: "Review",
    body: "We parse the plan, every command, every file. Nothing runs yet.",
    icon: ScanLine,
  },
  {
    n: "03",
    color: "var(--a-green)",
    tint: "rgba(17,255,153,0.10)",
    title: "Run",
    body: "Approve once. Streams live output straight to your terminal.",
    icon: Play,
  },
];

const SPECS = [
  { label: "Parses", value: "Markdown plans, bash, FILE: directives" },
  { label: "Runs", value: "npm, pnpm, python, vite, cargo" },
  { label: "Writes", value: "Files in an isolated workspace" },
  { label: "Streams", value: "stdout + stderr, line by line" },
];

const PRINCIPLES = [
  { n: "01", t: "Nothing runs without approval." },
  { n: "02", t: "The terminal is the interface." },
  { n: "03", t: "Diffs over rewrites." },
  { n: "04", t: "Local-first, always." },
  { n: "05", t: "Red is the color of work." },
];

/* 4 vertical pills like the HAVEN mood board */
const PILLS = [
  { top: "parse", bot: "paste", bg: "rgba(255,26,26,0.14)" },
  { top: "plan", bot: "review", bg: "var(--ao-bg-card)" },
  { top: "run", bot: "approve", bg: "var(--ao-text-primary)", dark: true },
  { top: "stream", bot: "ship", bg: "var(--ao-bg-card)" },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-8 pb-24">
      {/* ═══════════════ HERO ═══════════════ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerList(0.09, 0.08)}
        className="pt-8 md:pt-14"
      >
        {/* Top bar */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div
            className="inline-flex items-center gap-2.5 h-11 pl-2 pr-4 rounded-full"
            style={{
              background: "var(--ao-bg-surface)",
              border: "1px solid var(--frost)",
            }}
          >
            <span
              className="grid place-items-center w-7 h-7 rounded-full"
              style={{
                background: "rgba(255,26,26,0.10)",
                color: "var(--tertiary)",
              }}
            >
              <Logo size={16} />
            </span>
            <span className="text-[13px] font-semibold tracking-tight text-ink">
              AI <span className="text-accent">A1</span>
            </span>
            <span
              className="ml-1 inline-flex items-center gap-1.5 px-2 h-5 rounded-full font-mono text-[9.5px] uppercase tracking-[0.18em]"
              style={{
                background: "rgba(17,255,153,0.08)",
                color: "var(--a-green)",
              }}
            >
              <span
                className="block w-1 h-1 rounded-full"
                style={{ background: "var(--a-green)" }}
              />
              live
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/run"
              className="inline-flex items-center justify-center h-11 px-5 rounded-full text-[13px] font-medium text-(--primary) transition-colors duration-150 hover:bg-white/[0.06]"
              style={{ border: "1px solid var(--frost)" }}
            >
              Open runner
            </Link>
            <Link
              href="/explain"
              className="inline-flex items-center gap-1.5 justify-center h-11 px-5 rounded-full text-[13px] font-medium text-(--primary) transition-colors duration-150 hover:bg-white/[0.06]"
              style={{ border: "1px solid var(--frost)" }}
            >
              <BookOpen size={14} />
              Docs
            </Link>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display mt-12 md:mt-16 text-(--primary) max-w-[18ch]"
          style={{
            fontSize: "clamp(3rem, 9vw, 6.5rem)",
            lineHeight: 0.98,
            fontWeight: 400,
            letterSpacing: "-0.045em",
          }}
        >
          Run what the
          <br />
          model writes
          <span style={{ color: "var(--tertiary)" }}>.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[54ch] text-[15px] md:text-[16px] leading-[1.6] text-(--secondary)"
        >
          Paste the AI&apos;s Markdown response. AO-AI shows the plan, the
          setup commands, and every file it wants to write — then streams the
          output live once you approve.
        </motion.p>

        {/* ═══════════════ MOSAIC ═══════════════
            6 columns × 4 rows. Every cell filled:
              R1-2  :  A (2x2)  |  B (2x1)  |  C (2x2)
                               |  D (2x1)  |
              R3-4  :  E (2x2)  |  F (4x2)
        */}
        <motion.div
          variants={fadeUp}
          className="
            mt-10 grid gap-3 md:gap-4
            grid-cols-2 md:grid-cols-6
            grid-auto-rows-[170px] md:grid-auto-rows-[185px]
          "
        >
          {/* ── A · BRAND 2×2 ── */}
          <Tile
            className="col-span-2 row-span-2"
            style={{
              background:
                "radial-gradient(120% 120% at 20% 0%, rgba(255,26,26,0.20), transparent 55%), var(--ao-bg-surface)",
            }}
          >
            <div className="flex flex-col justify-between h-full">
              <span
                className="self-start inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{
                  border: "1px solid var(--frost)",
                  color: "var(--tertiary)",
                }}
              >
                terminal task runner
              </span>

              <div>
                <p
                  className="font-display text-(--primary)"
                  style={{
                    fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  AO<span style={{ color: "var(--tertiary)" }}>·</span>AI
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.55] text-(--secondary) max-w-[36ch]">
                  A theatre for your terminal. Paste, review, approve, stream.
                </p>
              </div>
            </div>
          </Tile>

          {/* ── B · PILLS 2×1 (like HAVEN) ── */}
          <Tile
            className="col-span-2 row-span-1"
            style={{ background: "var(--ao-bg-surface)" }}
          >
            <div className="flex items-stretch gap-2 h-full">
              {PILLS.map((p) => (
                <div
                  key={p.top}
                  className="flex-1 min-w-0 rounded-2xl flex flex-col items-center justify-between py-3 px-1 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: p.bg,
                    boxShadow:
                      p.bg === "var(--ao-bg-card)"
                        ? "inset 0 0 0 1px var(--frost)"
                        : "none",
                  }}
                >
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.18em]"
                    style={{
                      color: p.dark
                        ? "rgba(0,0,0,0.6)"
                        : "var(--ao-text-secondary)",
                    }}
                  >
                    {p.top}
                  </span>
                  <span
                    className="font-mono text-[9px] uppercase tracking-[0.18em]"
                    style={{
                      color: p.dark
                        ? "rgba(0,0,0,0.85)"
                        : "var(--ao-text-primary)",
                    }}
                  >
                    {p.bot}
                  </span>
                </div>
              ))}
            </div>
          </Tile>

          {/* ── C · GLOW LOGO 2×2 (like HAVEN big logo) ── */}
          <Tile
            className="col-span-2 row-span-2"
            style={{
              background:
                "radial-gradient(85% 85% at 50% 50%, rgba(255,26,26,0.22), transparent 65%), var(--ao-bg-surface)",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="grid place-items-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-4"
                style={{
                  background: "rgba(255,26,26,0.10)",
                  color: "var(--tertiary)",
                  boxShadow:
                    "0 0 60px 12px rgba(255,26,26,0.22), inset 0 0 20px rgba(255,26,26,0.10)",
                }}
              >
                <Logo size={36} />
              </div>
              <p
                className="font-display text-(--primary)"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                AO<span style={{ color: "var(--tertiary)" }}>·</span>AI
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-(--secondary)">
                v0.1
              </p>
            </div>
          </Tile>

          {/* ── D · MIDDLE CARD 2×1 (like Kuggle) ── */}
          <Tile
            className="col-span-2 row-span-1"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,26,26,0.08), transparent 70%), var(--ao-bg-surface)",
            }}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <p
                  className="font-display text-(--primary)"
                  style={{
                    fontSize: "1.35rem",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Aa
                </p>
                <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-(--tertiary)">
                  run locally
                </p>
              </div>
              <p className="text-[12px] leading-[1.5] text-(--secondary)">
                All commands execute on your machine. Files never leave it.
              </p>
            </div>
          </Tile>

          {/* ── E · LOCAL 2×2 (like door photo) ── */}
          <Tile
            className="col-span-2 row-span-2"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,26,26,0.14), rgba(0,0,0,0) 65%), var(--ao-bg-surface)",
            }}
          >
            <div className="flex flex-col justify-between h-full">
              <ArrowUpRight size={20} style={{ color: "var(--tertiary)" }} />

              <div
                className="mx-auto grid place-items-center w-24 h-24 rounded-3xl"
                style={{
                  border: "1px solid var(--frost)",
                  background: "var(--ao-bg-card)",
                }}
              >
                <Logo size={44} />
              </div>

              <div>
                <p
                  className="font-display text-(--primary)"
                  style={{
                    fontSize: "1.75rem",
                    lineHeight: 1,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Local
                  <br />
                  first.
                </p>
              </div>
            </div>
          </Tile>

          {/* ── F · WIDE LOGOTYPE 4×2 (like HAVEN) ── */}
          <Tile
            className="col-span-2 md:col-span-4 row-span-2"
            style={{
              background:
                "radial-gradient(90% 100% at 50% 100%, rgba(255,26,26,0.26), transparent 65%), var(--ao-bg-surface)",
            }}
          >
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <p
                className="font-display text-(--primary)"
                style={{
                  fontSize: "clamp(2.75rem, 7vw, 5rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.045em",
                  textShadow: "0 0 40px rgba(255,26,26,0.35)",
                }}
              >
                AO<span style={{ color: "var(--tertiary)" }}>·</span>AI
              </p>
              <p
                className="font-mono text-[10.5px] uppercase tracking-[0.28em]"
                style={{ color: "var(--secondary)" }}
              >
                a theatre for your terminal
              </p>
              <QuickStartButton
                label="Paste & go"
                className="btn btn-primary h-11"
                iconSize={14}
              />
            </div>
          </Tile>
        </motion.div>

        {/* CTA row */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <QuickStartButton
            label="Paste & go"
            className="btn btn-primary h-12"
            iconSize={15}
          />
          <Link href="/run" className="btn btn-secondary h-12">
            Open manually <ArrowUpRight size={15} />
          </Link>
          <Link href="/explain" className="btn btn-ghost h-12">
            <BookOpen size={15} /> Read the docs
          </Link>
        </motion.div>
      </motion.section>

      {/* ═══════════════ WORKFLOW ═══════════════ */}
      <section className="mt-24 md:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2
            className="text-(--primary)"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: "-0.04em",
            }}
          >
            Three moves.
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--secondary)">
            how it works
          </span>
        </div>

        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
          {MOVES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.n}
                className="p-6 md:p-7 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  borderRadius: 24,
                  background: "var(--ao-bg-surface)",
                  border: "1px solid var(--frost)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[12px] tracking-wider"
                    style={{ color: m.color }}
                  >
                    {m.n}
                  </span>
                  <span
                    className="grid place-items-center w-9 h-9 rounded-full"
                    style={{ background: m.tint, color: m.color }}
                  >
                    <Icon size={16} />
                  </span>
                </div>
                <h3 className="mt-6 text-[19px] font-medium text-(--primary)">
                  {m.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-(--secondary)">
                  {m.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ SPECS ═══════════════ */}
      <section className="mt-24 md:mt-32">
        <h2
          className="text-(--primary) max-w-[24ch]"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: "-0.04em",
          }}
        >
          Built for terminals, not dashboards.
        </h2>

        <div
          className="mt-10 p-2 md:p-3"
          style={{
            borderRadius: 28,
            background: "var(--ao-bg-surface)",
            border: "1px solid var(--frost)",
          }}
        >
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {SPECS.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[110px_1fr] gap-4 px-5 py-4"
                style={{ borderRadius: 20 }}
              >
                <dt
                  className="font-mono text-[11.5px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--tertiary)" }}
                >
                  {row.label}
                </dt>
                <dd className="text-[14.5px] leading-[1.55] text-(--primary)">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══════════════ PRINCIPLES ═══════════════ */}
      <section className="mt-24 md:mt-32">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2
            className="text-(--primary)"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: "-0.04em",
            }}
          >
            Principles.
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-(--secondary)">
            non-negotiable
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {PRINCIPLES.map((p) => (
            <div
              key={p.n}
              className="inline-flex items-center gap-3 h-12 px-5 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--ao-bg-surface)",
                border: "1px solid var(--frost)",
              }}
            >
              <span
                className="font-mono text-[12px] tracking-wider"
                style={{ color: "var(--tertiary)" }}
              >
                {p.n}
              </span>
              <span className="text-[13.5px] font-medium text-(--primary)">
                {p.t}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section
        className="mt-24 md:mt-32 p-10 md:p-16 text-center"
        style={{
          borderRadius: 32,
          background:
            "radial-gradient(80% 120% at 50% 0%, rgba(255,26,26,0.16), transparent 60%), var(--ao-bg-surface)",
          border: "1px solid var(--frost)",
        }}
      >
        <p
          className="font-mono text-[11.5px] uppercase tracking-[0.24em]"
          style={{ color: "var(--tertiary)" }}
        >
          ready
        </p>
        <h2
          className="font-display mt-5 text-(--primary)"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: "-0.035em",
          }}
        >
          A theatre for your terminal
          <span style={{ color: "var(--tertiary)" }}>.</span>
        </h2>
        <div className="mt-8 flex justify-center">
          <QuickStartButton
            label="Paste & go"
            className="btn btn-primary h-12"
            iconSize={15}
          />
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
function Tile({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative p-5 md:p-6 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
      style={{
        borderRadius: 24,
        background: "var(--ao-bg-surface)",
        border: "1px solid var(--frost)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
