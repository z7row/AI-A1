"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CornerDownLeft, Send, X } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "./ui/card";
import { CopyButton } from "./CopyButton";
import { Button } from "./ui/button";
import { stripAnsi } from "@/lib/api";
import { cn } from "@/lib/utils";

export function OutputCard({
  log,
  status,
  onSendInput,
}: {
  log: string;
  status: string;
  onSendInput?: (data: string) => void;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const stickRef = useRef(true);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    const onScroll = () => {
      stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    if (stickRef.current) el.scrollTop = el.scrollHeight;
  }, [log]);

  const interactive = status === "running" || status === "pending";

  function send(payload: string) {
    onSendInput?.(payload);
    stickRef.current = true;
    inputRef.current?.focus();
  }

  function sendLine() {
    send(input + "\n");
    setInput("");
  }

  function sendKey(seq: string) {
    send(seq);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              status === "running" && "bg-accent animate-pulseRed",
              status === "done" && "bg-snow",
              status === "stopped" && "bg-ink-soft",

              (status === "failed" || status === "killed") && "bg-accent-deep",
              status === "pending" && "bg-ink-mute",
            )}
          />
          Output
          {interactive && (
            <span className="ml-1 text-[11px] text-ink-mute">
              — interactive
            </span>
          )}
        </CardTitle>
        <CopyButton text={log} />
      </CardHeader>
      <CardBody>
        <pre
          ref={preRef}
          className="h-[420px] overflow-auto rounded-btn border border-line bg-[#050505] p-4 font-mono text-[12.5px] leading-relaxed text-snow whitespace-pre-wrap wrap-break-word"
        >
          <code>{stripAnsi(log) || "— waiting for output —"}</code>
        </pre>

        {interactive && onSendInput && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendLine();
                  }
                }}
                placeholder="Type here and press Enter to send to the process…"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-btn border border-line bg-[#0d0d0d] px-3 py-2 font-mono text-[12.5px] text-ink placeholder:text-ink-mute focus:border-accent focus:outline-none"
              />
              <Button
                variant="primary"
                size="md"
                onClick={sendLine}
                title="Send"
              >
                <Send size={14} /> Send
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute">
              <span className="mr-1">Quick keys:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendKey("\x1b[A")}
                title="Up arrow"
              >
                <ArrowUp size={13} /> Up
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendKey("\x1b[B")}
                title="Down arrow"
              >
                <ArrowDown size={13} /> Down
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendKey("\r")}
                title="Enter"
              >
                <CornerDownLeft size={13} /> Enter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => sendKey("\x03")}
                title="Ctrl+C (interrupt)"
              >
                <X size={13} /> Ctrl+C
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
