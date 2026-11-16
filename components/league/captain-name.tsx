import { CrownIcon } from "@/components/ui/crown-icon";
import { cn } from "@/lib/cn";

/**
 * A team captain's name with a crown in front, in small dimmed uppercase.
 * Screen readers hear "Captain" in place of the crown.
 * @param className - Text size and spacing; defaults to `text-xs`.
 */
export function CaptainName({ name, className = "text-xs" }: { name: string; className?: string }) {
  if (!name) return null;
  return (
    <span className={cn("flex min-w-0 items-center gap-1 tracking-wide text-auh-cream-dim uppercase", className)}>
      <CrownIcon className="size-[1.1em] shrink-0 text-auh-yellow" />
      <span className="sr-only">Captain</span>
      <span className="truncate">{name}</span>
    </span>
  );
}
