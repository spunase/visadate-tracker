/**
 * Freshness evaluation logic for VisaDateTracker content.
 *
 * Different content types have different shelf lives:
 * - **Bulletin rows** are fresh until the next bulletin (roughly monthly).
 * - **Chart-use selections** are valid only for the designated month.
 * - **Policy content** has an explicit review window.
 * - **News items** carry their own `staleAfterDate`.
 *
 * Stale items must be visually demoted in the UI — this module provides the
 * status and warning messages that the presentation layer needs.
 *
 * @module content/freshness
 */

import {
  differenceInDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";

import type { ContentType, FreshnessResult, FreshnessStatus } from "./types";

// ---------------------------------------------------------------------------
// Thresholds (in days)
// ---------------------------------------------------------------------------

/** Default thresholds when no content-specific rule applies. */
const DEFAULT_AGING_DAYS = 20;
const DEFAULT_STALE_DAYS = 35;

/** Bulletin-specific thresholds. */
const BULLETIN_AGING_DAYS = 20;
const BULLETIN_STALE_DAYS = 40;

// ---------------------------------------------------------------------------
// Core evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate the freshness of any content item.
 *
 * @param publishedAt - ISO-8601 date string (or Date) when the content was published.
 * @param expiresAt   - ISO-8601 date string (or Date) when the content is no longer valid. May be `null` for evergreen content.
 * @param contentType - The kind of content, which determines threshold rules.
 * @param now         - Override for "today" (useful in tests).
 * @returns A {@link FreshnessResult} with status, age, and optional warning.
 */
export function evaluateFreshness(
  publishedAt: string | Date,
  expiresAt: string | Date | null,
  contentType: ContentType,
  now: Date = new Date()
): FreshnessResult {
  const published = typeof publishedAt === "string" ? parseISO(publishedAt) : publishedAt;
  const expires = expiresAt
    ? typeof expiresAt === "string"
      ? parseISO(expiresAt)
      : expiresAt
    : null;

  const today = startOfDay(now);
  const daysOld = differenceInDays(today, startOfDay(published));
  const daysUntilExpiry = expires ? differenceInDays(startOfDay(expires), today) : Infinity;

  // If an explicit expiry exists and has passed, the item is expired.
  if (expires && isBefore(startOfDay(expires), today)) {
    return {
      status: "expired",
      daysOld,
      daysUntilExpiry: daysUntilExpiry as number,
      warningMessage: "This content has expired. Please verify with the latest official source.",
    };
  }

  // Content-type-specific aging / stale thresholds.
  const agingDays = contentType === "bulletin" ? BULLETIN_AGING_DAYS : DEFAULT_AGING_DAYS;
  const staleDays = contentType === "bulletin" ? BULLETIN_STALE_DAYS : DEFAULT_STALE_DAYS;

  let status: FreshnessStatus;
  let warningMessage: string | null = null;

  if (daysOld >= staleDays) {
    status = "stale";
    warningMessage =
      "This content may be outdated. A newer version may be available from the official source.";
  } else if (daysOld >= agingDays) {
    status = "aging";
    warningMessage =
      "This content is getting older. Check the official source for any recent updates.";
  } else {
    status = "fresh";
  }

  return {
    status,
    daysOld,
    daysUntilExpiry: Number.isFinite(daysUntilExpiry) ? (daysUntilExpiry as number) : -1,
    warningMessage,
  };
}

// ---------------------------------------------------------------------------
// Bulletin freshness
// ---------------------------------------------------------------------------

/**
 * Determine the freshness of a Visa Bulletin for a given month.
 *
 * Bulletins are considered fresh from the start of their effective month until
 * the next month's bulletin would normally be published (roughly the start of
 * the following month). After that they transition through aging → stale.
 *
 * @param bulletinMonth - The effective month of the bulletin, e.g. "2025-04" or a Date.
 * @param now           - Override for "today".
 */
export function getBulletinFreshness(
  bulletinMonth: string | Date,
  now: Date = new Date()
): FreshnessStatus {
  const monthDate =
    typeof bulletinMonth === "string" ? parseISO(`${bulletinMonth}-01`) : bulletinMonth;
  const monthStart = startOfMonth(monthDate);
  const nextMonthStart = startOfMonth(addMonths(monthDate, 1));
  const today = startOfDay(now);

  // Before the bulletin's effective month — shouldn't happen often, but treat as fresh.
  if (isBefore(today, monthStart)) return "fresh";

  // Within the effective month — definitely fresh.
  if (!isAfter(today, endOfMonth(monthDate))) return "fresh";

  // After the effective month: use day-based thresholds relative to month end.
  const daysPast = differenceInDays(today, nextMonthStart);

  if (daysPast < BULLETIN_AGING_DAYS) return "fresh";
  if (daysPast < BULLETIN_STALE_DAYS) return "aging";
  return "stale";
}

// ---------------------------------------------------------------------------
// Chart-use freshness
// ---------------------------------------------------------------------------

/**
 * Chart-use selections are valid **only** for the designated month.
 *
 * @param bulletinMonth - The month the chart-use applies to, e.g. "2025-04".
 * @param now           - Override for "today".
 */
export function getChartUseFreshness(
  bulletinMonth: string | Date,
  now: Date = new Date()
): FreshnessStatus {
  const monthDate =
    typeof bulletinMonth === "string" ? parseISO(`${bulletinMonth}-01`) : bulletinMonth;
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const today = startOfDay(now);

  if (isBefore(today, monthStart)) return "fresh"; // upcoming — treat as fresh
  if (!isAfter(today, monthEnd)) return "fresh"; // within month
  return "expired"; // any time after the month ends
}

// ---------------------------------------------------------------------------
// Policy freshness
// ---------------------------------------------------------------------------

/**
 * Evaluate freshness for general policy content with an explicit review/expiry date.
 *
 * @param publishedAt - When the policy was published.
 * @param expiresAt   - When the policy's review window ends.
 * @param now         - Override for "today".
 */
export function getPolicyFreshness(
  publishedAt: string | Date,
  expiresAt: string | Date,
  now: Date = new Date()
): FreshnessStatus {
  return evaluateFreshness(publishedAt, expiresAt, "policy", now).status;
}
