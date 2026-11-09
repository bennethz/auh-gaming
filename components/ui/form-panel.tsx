import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Shared classes for text inputs, selects and textareas on navy panels. */
export const INPUT_CLASS_NAME =
  "w-full min-h-11 border-2 border-transparent bg-auh-ink-soft px-3 py-2.5 font-body text-[15px] text-auh-cream focus:border-auh-yellow focus:outline-none";

/** Label wrapping a single form control. */
export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px] font-semibold text-auh-cream-dim", className)}>
      {label}
      {children}
    </label>
  );
}

type FormPanelProps = ComponentProps<"form"> & {
  title: string;
  /** Heading level for the panel title, so it fits the page outline. */
  titleAs?: "h2" | "h3";
};

/** Notched navy form panel with a yellow title. */
export function FormPanel({ title, titleAs: Title = "h2", className, children, ...props }: FormPanelProps) {
  return (
    <form className={cn("notch flex flex-col gap-3 bg-auh-ink p-[22px] text-auh-cream", className)} {...props}>
      <Title className="mb-1 font-display text-[30px] leading-none font-medium text-auh-yellow">{title}</Title>
      {children}
    </form>
  );
}
