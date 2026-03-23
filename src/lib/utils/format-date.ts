/**
 * Date formatting utilities for VisaDateTracker.
 *
 * @module utils/format-date
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_ABBREV = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Formats a bulletin month string into a human-readable label.
 * @example formatBulletinMonth("2026-03") // "March 2026"
 */
export function formatBulletinMonth(month: string): string {
  const [yearStr, monthStr] = month.split("-");
  const monthIndex = parseInt(monthStr, 10) - 1;
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return month;
  return `${MONTH_NAMES[monthIndex]} ${yearStr}`;
}

/**
 * Formats a cutoff date string into a display-friendly format.
 * Returns "Current" for null/undefined values.
 * @example formatCutoffDate("2012-09-01") // "Sep 01, 2012"
 * @example formatCutoffDate(null) // "Current"
 */
export function formatCutoffDate(date: string | null | undefined): string {
  if (!date) return "Current";
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return date;
  const month = MONTH_ABBREV[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Formats an ISO date string into a human-readable relative date.
 * @example formatRelativeDate("2026-03-23T00:00:00Z") // "today"
 * @example formatRelativeDate("2026-03-21T00:00:00Z") // "2 days ago"
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return isoDate;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "upcoming";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}
