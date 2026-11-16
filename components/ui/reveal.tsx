"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Longer than the longest staggered entrance in globals.css (a full standings table or tile grid). */
const ENTRANCE_DURATION_MS = 1600;

/**
 * Plays a one-shot entrance the first time its content scrolls into view (styles in globals.css):
 * - `rise` (default): for showcase sections. The section fades in and lifts; `reveal-item` children
 *   (with a `--i` index style) follow in a stagger.
 * - `fade`: for data people come to read (standings, matches). Only `reveal-item` children fade in, quickly
 *   and without moving, so everything stays aligned.
 * Without JavaScript or with reduced motion, the content simply shows.
 */
export function Reveal({
  variant = "rise",
  className,
  children,
}: {
  variant?: "rise" | "fade";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let doneTimer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.dataset.revealed = "";
          observer.disconnect();
          // Hand transitions back to the components (hover effects) once the entrance has played.
          doneTimer = window.setTimeout(() => {
            element.dataset.revealDone = "";
          }, ENTRANCE_DURATION_MS);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div ref={ref} data-reveal={variant} className={className}>
      {children}
    </div>
  );
}
