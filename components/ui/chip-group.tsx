"use client";

import { cn } from "@/lib/cn";

export interface ChipOption<Value extends string> {
  value: Value;
  label: string;
}

interface ChipGroupProps<Value extends string> {
  /** Accessible name for the group, for example "Filter matches". */
  label: string;
  options: ReadonlyArray<ChipOption<Value>>;
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  "data-testid"?: string;
}

/** Single-select set of filter or tab chips using `aria-pressed`. */
export function ChipGroup<Value extends string>({
  label,
  options,
  value,
  onChange,
  className,
  "data-testid": testId,
}: ChipGroupProps<Value>) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)} data-testid={testId}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          data-testid={testId ? `${testId}-${option.value}` : undefined}
          className="min-h-11 border-2 border-auh-ink bg-transparent px-3.5 py-[7px] text-sm font-semibold text-auh-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-auh-orange aria-pressed:bg-auh-ink aria-pressed:text-auh-yellow"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
