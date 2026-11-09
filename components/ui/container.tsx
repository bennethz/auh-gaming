import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Centers content at the standard 1180px width with page gutters. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1180px] px-5", className)}>{children}</div>;
}
