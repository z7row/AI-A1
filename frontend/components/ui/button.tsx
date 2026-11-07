"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva(
  `flex items-center justify-center gap-2 whitespace-nowrap text-[14px] font-medium transition-all 
rounded-full focus-visible:outline-none focus-visible:ring-2 
  focus-visible:ring-accent/40 disabled:opacity-40 disabled:pointer-events-none  duration-100
   active:scale-95`,
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white border border-accent-bright hover:bg-accent-bright ",
        secondary:
          "bg-card text-ink border border-line hover:bg-subtle hover:border-ink-mute",
        ghost: "bg-transparent text-ink-soft hover:bg-subtle hover:text-ink",
        danger:
          "bg-accent text-white border border-accent-bright hover:bg-accent-bright",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
