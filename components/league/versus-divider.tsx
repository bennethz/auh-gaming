import { cn } from "@/lib/cn";

/**
 * Thin line between the two teams of a match card with "VS" in the middle. Decorative only.
 * @param lineClassName - Line colour; pick one that shows on the card's background.
 */
export function VersusDivider({ lineClassName = "bg-auh-ink-soft" }: { lineClassName?: string }) {
  return (
    <span aria-hidden="true" className="flex items-center gap-2 px-3.5">
      <span className={cn("h-px flex-1", lineClassName)} />
      <span className="font-display text-xs leading-none tracking-wider text-auh-cream-dim">VS</span>
      <span className={cn("h-px flex-1", lineClassName)} />
    </span>
  );
}
