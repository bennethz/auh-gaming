import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  /** Filters, links or legends shown on the right. */
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
}

/** Section title and description on the left, with optional controls on the right. */
export function SectionHeading({ id, title, description, aside, className, titleClassName }: SectionHeadingProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2
          id={id}
          className={cn("font-display text-[clamp(44px,5vw,64px)] leading-[0.85] font-semibold", titleClassName)}
        >
          {title}
        </h2>
        {description ? <p className="mt-2 text-base text-auh-olive">{description}</p> : null}
      </div>
      {aside}
    </div>
  );
}
