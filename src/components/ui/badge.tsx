import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "green" | "red" | "amber" | "grey" | "blue";

const tones: Record<Tone, string> = {
  green: "bg-brand-light text-brand-dark",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  grey: "bg-surface text-ink/70",
  blue: "bg-blue-100 text-blue-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "grey", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
