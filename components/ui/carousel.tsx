"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Space between slides, in px. Matches the track's `gap-3`. */
const GAP = 12;

interface CarouselProps {
  /** The slides, each an `<li>`. Give them a fixed width and `snap-start`. */
  children: ReactNode;
  /** Accessible name for the slide region, such as "Other upcoming playoff matches". */
  label: string;
  /** Shown on the left of the controls row, for example a heading. */
  header?: ReactNode;
  className?: string;
}

/**
 * Horizontal carousel: a native scroll-snap track (swipe, trackpad and keyboard scrolling all work)
 * with previous / next buttons that move by a page of slides and switch off at either end.
 */
export function Carousel({ children, label, header, className }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setCanPrev(track.scrollLeft > 1);
      setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    };
    // The observer fires once on attach, which sets the initial button state.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    return () => {
      resizeObserver.disconnect();
      track.removeEventListener("scroll", update);
    };
  }, []);

  const page = (direction: 1 | -1) => {
    const track = trackRef.current;
    const slide = track?.querySelector("li");
    if (!track || !slide) return;
    const step = slide.getBoundingClientRect().width + GAP;
    const perPage = Math.max(1, Math.floor((track.clientWidth + GAP) / step));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * perPage * step, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const showControls = canPrev || canNext;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">{header}</div>
        {showControls ? (
          <div className="flex gap-2">
            <CarouselButton label="Previous" disabled={!canPrev} onClick={() => page(-1)}>
              ←
            </CarouselButton>
            <CarouselButton label="Next" disabled={!canNext} onClick={() => page(1)}>
              →
            </CarouselButton>
          </div>
        ) : null}
      </div>
      {/* Scrolls inside its own wrapper so the page never scrolls sideways. */}
      <div
        ref={trackRef}
        className="-mx-5 snap-x snap-mandatory scroll-px-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <ul className="flex w-max gap-3">{children}</ul>
      </div>
    </div>
  );
}

function CarouselButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "notch focus-notch inline-flex size-11 items-center justify-center bg-auh-ink-soft pt-1 font-display text-2xl leading-none text-auh-yellow transition-colors",
        "hover:bg-auh-yellow hover:text-auh-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-auh-ink-soft disabled:hover:text-auh-yellow",
      )}
    >
      {children}
    </button>
  );
}
