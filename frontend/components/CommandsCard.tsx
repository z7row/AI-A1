"use client";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/card";
import { CopyButton } from "./CopyButton";
import { ShowMore } from "./ShowMore";

export function CommandsCard({ commands }: { commands: string }) {
  if (!commands.trim()) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup commands</CardTitle>
        <CopyButton text={commands} />
      </CardHeader>
      <CardBody>
        <ShowMore collapsedHeight={280}>
          <pre className="overflow-auto rounded-btn border border-line bg-[#0b0b0b] p-4 font-mono text-[12.5px] leading-relaxed text-snow whitespace-pre-wrap">
            <code>{commands}</code>
          </pre>
        </ShowMore>
      </CardBody>
    </Card>
  );
}
