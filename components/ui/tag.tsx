import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TagTone = "ink" | "yellow" | "orange" | "cream" | "muted";

const TONE_CLASS_NAMES: Record<TagTone, string> = {
  ink: "bg-auh-ink text-auh-yellow",
  yellow: "bg-auh-yellow text-auh-ink",
  orange: "bg-auh-orange text-auh-ink",
  cream: "bg-auh-cream text-auh-ink",
  muted: "bg-auh-ink-soft text-auh-cream-dim",
};

interface TagProps {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}

/** Small label in body type, for categories and metadata. */
export function Tag({ tone = "ink", className, children, ...rest }: TagProps) {
  return (
    <span className={cn("px-2 py-[3px] text-xs font-semibold", TONE_CLASS_NAMES[tone], className)} {...rest}>
      {children}
    </span>
  );
}

/** Larger label in display type, for states that need attention (for example "Group stage live"). */
export function Badge({ tone = "orange", className, children, ...rest }: TagProps) {
  return (
    <span
      className={cn("px-2 pt-[5px] pb-0.5 font-display text-xl leading-none", TONE_CLASS_NAMES[tone], className)}
      {...rest}
    >
      {children}
    </span>
  );
}
