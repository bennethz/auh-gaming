"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Manages a single toast message that hides itself after a delay.
 * @param durationMs - How long the toast stays visible.
 * @returns The current message (null when hidden) and a function to show a new one.
 */
export function useToast(durationMs = 2500) {
  const [message, setMessage] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback(
    (nextMessage: string) => {
      clearTimeout(hideTimer.current);
      setMessage(nextMessage);
      hideTimer.current = setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs],
  );

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  return { message, showToast };
}

/**
 * Status message fixed to the bottom of the screen.
 * The live region stays mounted so screen readers announce new messages.
 */
export function Toast({ message }: { message: string | null }) {
  const isVisible = message !== null;

  return (
    <div
      role="status"
      data-testid="toast"
      className={cn(
        "fixed bottom-6 left-1/2 z-20 -translate-x-1/2 bg-auh-orange px-5 py-3 font-bold text-auh-ink transition-[translate,visibility] duration-200",
        isVisible ? "visible translate-y-0" : "invisible translate-y-[calc(100%+24px)]",
      )}
    >
      {message}
    </div>
  );
}
