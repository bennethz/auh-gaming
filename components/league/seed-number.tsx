import { cn } from "@/lib/cn";

/** A team's playoff seed shown before its name, such as "#3". */
export function SeedNumber({ seed, className }: { seed?: number; className?: string }) {
  if (seed === undefined) return null;
  return (
    <span
      className={cn("shrink-0 text-xs font-semibold text-auh-cream-dim tabular-nums", className)}
      aria-label={`Seed ${seed}`}
      data-testid="seed-number"
    >
      #{seed}
    </span>
  );
}
