"use client";

import Image from "next/image";
import type { FaviconState } from "@/lib/favicon";

const DOT_COLOR: Record<FaviconState, string> = {
  idle: "#000000",
  running: "#ff1a1a",
  done: "#11ff99",
  stopped: "#737373",
  failed: "#ff1a1a",
  killed: "#ff1a1a",
};

/** Plain brand mark — always the site logo image. Use in Nav, headers, footers. */
export function LogoMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.png"
      alt="AO-AI"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

/** Brand mark + status dot. Use ONLY in the workspace header. */
export function LogoMarkStatus({
  state = "idle",
  size = 22,
}: {
  state?: FaviconState;
  size?: number;
}) {
  const showDot = state !== "idle";
  const dot = showDot ? DOT_COLOR[state] : null;
  const pulsing = state === "running";
  
  // Make the dot slightly smaller relative to the image size
  const dotSize = Math.max(8, Math.round((size * 12) / 64));

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Image
        src="/logo.png"
        alt="AO-AI"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {showDot && dot && (
        <span
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: dot,
            border: "2px solid var(--ao-bg-canvas)", // Gives the dot a nice cutout effect
            transition: "background 320ms ease",
            animation: pulsing
              ? "logoPulse 1.4s ease-in-out infinite"
              : undefined,
          }}
        />
      )}
    </span>
  );
}
