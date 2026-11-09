import { cn } from "@/lib/cn";

/** Yellow block for a date or key number, shown inside a dark card. */
export function DateBlock({ day, month, className }: { day: string; month: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex h-20 w-[76px] shrink-0 flex-col items-center justify-center border-3 border-auh-ink bg-auh-yellow font-display leading-[0.85] text-auh-ink sm:w-24",
        className,
      )}
    >
      <span className="text-[44px] font-bold tabular-nums">{day}</span>
      <span className="text-xl">{month}</span>
    </div>
  );
}
