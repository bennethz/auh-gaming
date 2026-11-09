import { cn } from "@/lib/cn";

interface PlaceholderProps {
  /** What the real asset will be, for example "Partner logo". */
  label: string;
  /** Use "ink" on yellow backgrounds and "cream" on navy backgrounds. */
  tone?: "ink" | "cream";
  /** 3px border instead of 2px, for large placeholders. */
  isThick?: boolean;
  /** Size, font size and any extra classes. */
  className?: string;
  "data-testid"?: string;
}

/**
 * Dashed box marking an image that has not been supplied yet.
 * Exposed as an image so screen readers announce what belongs there.
 */
export function Placeholder({ label, tone = "ink", isThick = false, className, ...rest }: PlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center border-dashed text-center font-semibold",
        isThick ? "border-3" : "border-2",
        tone === "ink" ? "border-auh-ink text-auh-ink" : "border-auh-cream-dim text-auh-cream-dim",
        className,
      )}
      {...rest}
    >
      {label}
    </div>
  );
}
