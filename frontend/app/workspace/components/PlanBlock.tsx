"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function PlanBlock({ plan }: { plan: string }) {
  return (
    <div className="md text-[14.5px] leading-[1.75] text-(--primary)" dir="auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
    </div>
  );
}
