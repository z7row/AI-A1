import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt="AO-AI"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}
