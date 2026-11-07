"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/card";
import { CopyButton } from "./CopyButton";
import { ShowMore } from "./ShowMore";

export function PlanCard({ title, plan }: { title?: string; plan: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ? `Plan — ${title}` : "Plan"}</CardTitle>
        <CopyButton text={plan} />
      </CardHeader>
      <CardBody>
        <ShowMore>
          <div className="md text-[14px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
          </div>
        </ShowMore>
      </CardBody>
    </Card>
  );
}
