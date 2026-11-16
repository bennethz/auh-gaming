/** All league times are shown in Gulf Standard Time. */
const LEAGUE_TIME_ZONE = "Asia/Dubai";

/**
 * Splits an ISO date-time into the parts shown in a date block and meta line.
 * @param isoDateTime - ISO 8601 date-time with offset, for example "2026-11-14T20:00:00+04:00".
 * @returns Day of month ("14"), short month ("Nov") and 24-hour time ("20:00").
 */
export function getMatchDateParts(isoDateTime: string): {
  day: string;
  month: string;
  time: string;
} {
  const date = new Date(isoDateTime);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: LEAGUE_TIME_ZONE,
      ...options,
    }).format(date);

  return {
    day: format({ day: "numeric" }),
    month: format({ month: "short" }),
    time: format({ hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

/**
 * Formats an ISO date-time as a readable calendar date in league time.
 * @param isoDateTime - ISO 8601 date-time with offset.
 * @returns A date such as "7 Nov 2026".
 */
export function formatLongDate(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LEAGUE_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDateTime));
}

/**
 * Formats a calendar date as "Ddd DD MMM YYYY".
 * @param dateValue - A "YYYY-MM-DD" date, as a date input returns it.
 * @returns For example "Sat 05 Dec 2026".
 */
export function formatCalendarDate(dateValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  // Format in UTC so the calendar date never shifts with the viewer's time zone.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(Date.UTC(year, month - 1, day)));
  // Assembled from parts so the separators are the same in every browser.
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")}, ${part("day")} ${part("month")} ${part("year")}`;
}
