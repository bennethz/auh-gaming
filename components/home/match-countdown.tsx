"use client";

import { useSyncExternalStore } from "react";

/** All league dates are in Gulf Standard Time. */
const LEAGUE_TIME_ZONE = "Asia/Dubai";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Re-checks the date every minute so "Tomorrow" turns into "Today" without a reload. */
function subscribe(onChange: () => void): () => void {
  const interval = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(interval);
}

/** Today's date in league time as "YYYY-MM-DD". A string, so React only re-renders when the day changes. */
function getLeagueToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LEAGUE_TIME_ZONE }).format(new Date());
}

/** No "today" while prerendering: the page is static, so the countdown only appears in the browser. */
function getServerToday(): null {
  return null;
}

/**
 * Days from one calendar date to another.
 * @param from - "YYYY-MM-DD".
 * @param to - "YYYY-MM-DD".
 */
function daysBetween(from: string, to: string): number {
  const toUtc = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/**
 * Countdown to a match day, such as "Today", "Tomorrow" or "In 3 days".
 * Renders nothing on the server, and nothing once the match day has passed.
 * @param matchDate - Match day as "YYYY-MM-DD".
 */
export function MatchCountdown({ matchDate, className }: { matchDate: string; className?: string }) {
  const today = useSyncExternalStore(subscribe, getLeagueToday, getServerToday);
  if (!today) return null;

  const days = daysBetween(today, matchDate);
  if (days < 0) return null;
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;

  return (
    <span className={className} data-testid="match-countdown">
      {label}
    </span>
  );
}
