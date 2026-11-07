"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import { ShowMore } from "@/components/ShowMore";
import { CopyButton } from "@/components/CopyButton";
import { FIRST_PROMPT } from "@/lib/prompts";
import { fadeUp, staggerList } from "@/components/motion";

type Lang = "en" | "ar";

const COPY = {
  en: {
    eyebrow: "documentation",
    title: "How AO-AI works",
    intro:
      "AO-AI is a thin bridge between an LLM that emits Markdown and your shell. Nothing runs until you press Run.",
    s1: "1 · Prepare your model",
    s1body:
      "Copy this prompt to your model. It instructs the LLM to emit a response in the exact format AO-AI expects.",
    s2: "2 · Paste the response",
    s2body:
      "Your model returns Markdown with a title, a plan, optional setup commands, and FILE: directives. Paste it on the Run page and press Run.",
    s3: "3 · Review & run",
    s3body1:
      "The workspace shows the plan, the exact commands, and every file. AO-AI scans for dangerous patterns — rm -rf /, mkfs, dd if=, chmod -R 777 /, fork bombs, curl | bash.",
    s3body2:
      "On Run, the backend gets a process ID, writes the script, and streams stdout + stderr over WebSocket straight into the output panel. Cancel kills it. Clear resets it.",
    s4: "4 · Backend contract",
    s5: "5 · Keyboard shortcuts",
    s5body:
      "Ctrl+Enter → Start / Run · Ctrl+Shift+V → Paste · Ctrl+Shift+X → Clear · Esc → Cancel (workspace only)",
    swap: "العربية",
  },
  ar: {
    eyebrow: "التوثيق",
    title: "إزاي AO-AI بيشتغل",
    intro:
      "AO-AI جسر رفيع بين موديل بيكتب Markdown وبين الطرفية عندك. مفيش أي حاجة بتشتغل غير لما تدوس Run.",
    s1: "١ · جهّز الموديل",
    s1body:
      "انسخ البرومبت ده للموديل. بيوجّهه يطلّع رد بنفس الشكل اللي AO-AI متوقّعه بالظبط.",
    s2: "٢ · الصق الرد",
    s2body:
      "الموديل بيرجّع Markdown فيه عنوان، وخطة، وأوامر setup اختيارية، و FILE: directives. الصقه في صفحة Run وادوس Run.",
    s3: "٣ · راجع وشغّل",
    s3body1:
      "الـworkspace بيعرض الخطة، والأوامر بالظبط، وكل ملف. AO-AI بيفحص أنماط الخطر — rm -rf /، mkfs، dd if=، chmod -R 777 /، fork bombs، curl | bash.",
    s3body2:
      "لما تدوس Run، الباك إند بياخد process ID، بيكتب السكريبت، ويبثّ stdout + stderr على WebSocket مباشرة للـoutput. Cancel بيقتل العملية. Clear بيرجّع الشاشة.",
    s4: "٤ · عقد الباك إند",
    s5: "٥ · اختصارات الكيبورد",
    s5body:
      "Ctrl+Enter → تشغيل · Ctrl+Shift+V → لصق · Ctrl+Shift+X → مسح · Esc → إلغاء (في الـ workspace)",
    swap: "English",
  },
} as const;

const BACKEND_CONTRACT = `GET  /                  → { ok: true }
POST /run               → { id, status }
GET  /processes         → ProcessInfo[]
GET  /processes/{id}       → ProcessInfo
GET  /progress/{id}         → { progress, tasks_total, tasks_done }
GET  /log/{id}              → { log }
POST /kill/{id}            → { ok, status }
WS   /ws/{id}              → snapshot | output | progress | status`;

export default function ExplainPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];
  const rtl = lang === "ar";

  return (
    <div
      className="mx-auto w-full max-w-[860px] px-5 md:px-8 py-10 md:py-14"
      dir={rtl ? "rtl" : "ltr"}
      lang={lang}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--ao-text-muted)">
            {t.eyebrow}
          </span>

          <h1
            className="font-display mt-2 text-(--ao-text-primary)"
            style={{
              fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)",
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: rtl ? "0" : "-0.8px",
            }}
          >
            {t.title}
            <span style={{ color: "var(--ao-red)" }}>.</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="btn btn-outline shrink-0"
        >
          <Languages size={13} />
          {t.swap}
        </button>
      </header>

      <p className="mt-5 max-w-[64ch] text-[14px] leading-[1.7] text-(--ao-text-secondary)">
        {t.intro}
      </p>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerList(0.08)}
        className="mt-8 space-y-4"
      >
        <Section title={t.s1} copy={FIRST_PROMPT}>
          <p className="text-[13.5px] leading-[1.7] text-(--ao-text-secondary) mb-3">
            {t.s1body}
          </p>
          <ShowMore collapsedHeight={200}>
            <CodeBlock code={FIRST_PROMPT} wrap />
          </ShowMore>
        </Section>

        <Section title={t.s2}>
          <p className="text-[13.5px] leading-[1.7] text-(--ao-text-secondary)">
            {t.s2body}
          </p>
        </Section>

        <Section title={t.s3}>
          <div className="space-y-3 text-[13.5px] leading-[1.7] text-(--ao-text-secondary)">
            <p>{t.s3body1}</p>
            <p>{t.s3body2}</p>
          </div>
        </Section>

        <Section title={t.s4} copy={BACKEND_CONTRACT}>
          <ShowMore collapsedHeight={180}>
            <CodeBlock code={BACKEND_CONTRACT} />
          </ShowMore>
        </Section>

        <Section title={t.s5}>
          <p className="text-[13.5px] leading-[1.7] text-(--ao-text-secondary)">
            {t.s5body}
          </p>
        </Section>
      </motion.div>
    </div>
  );
}

function Section({
  title,
  copy,
  children,
}: {
  title: string;
  copy?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      className="px-5 py-4"
      style={{
        borderRadius: 16,
        border: "1px solid var(--frost)",
        boxShadow: "var(--ring) 0 0 0 1px",
        background: "var(--ao-bg-card)",
      }}
    >
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[14px] font-medium text-(--ao-text-primary)">
          {title}
        </h2>
        {copy && <CopyButton text={copy} label="" />}
      </header>
      {children}
    </motion.section>
  );
}

function CodeBlock({ code, wrap }: { code: string; wrap?: boolean }) {
  return (
    <pre
      dir="ltr"
      className="font-mono text-[11.5px] leading-[1.7] text-(--ao-text-primary) px-3 py-3 overflow-auto text-left"
      style={{
        background: "var(--ao-bg-surface)",
        border: "1px solid var(--frost)",
        borderRadius: 8,
        whiteSpace: wrap ? "pre-wrap" : "pre",
        // wordBreak: wrap ? "wrap-break-word" : "normal",
        maxHeight: 340,
      }}
    >
      <code>{code}</code>
    </pre>
  );
}
