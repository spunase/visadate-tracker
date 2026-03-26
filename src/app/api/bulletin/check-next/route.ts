import { NextResponse } from "next/server";

/**
 * GET /api/bulletin/check-next
 *
 * Probes the DOS website to check if the next month's visa bulletin
 * has been published. Returns availability status and the official URL.
 *
 * The DOS typically publishes bulletins around the 8th–15th of each month
 * for the following month. For example, in March 2026 they would publish
 * the April 2026 bulletin.
 */

const BASE_URL =
  "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin";

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function getNextBulletinInfo(): { month: string; year: number; monthName: string; url: string } {
  const now = new Date();
  // The "next" bulletin is for the month AFTER the current month.
  // But DOS publishes them in the current month. So if we're in March 2026,
  // the current bulletin is March 2026 and the next one is April 2026.
  const nextMonth = now.getMonth() + 1; // 0-based + 1 = current 1-based
  const nextYear = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
  const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;

  const monthName = MONTH_NAMES[adjustedMonth];
  const year = nextYear;
  const displayMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return {
    month: displayMonth,
    year,
    monthName,
    url: `${BASE_URL}/${year}/visa-bulletin-for-${monthName}-${year}.html`,
  };
}

export async function GET() {
  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
  };

  const next = getNextBulletinInfo();

  try {
    // Use HEAD request to minimize bandwidth — we only need to know if the page exists
    const response = await fetch(next.url, {
      method: "HEAD",
      headers: {
        "User-Agent":
          "VisaDateTracker/1.0 (bulletin-check; contact: admin@visadatetracker.app)",
      },
      signal: AbortSignal.timeout(10_000),
    });

    const available = response.ok;

    return NextResponse.json(
      {
        available,
        month: next.month,
        year: next.year,
        url: next.url,
        checkedAt: new Date().toISOString(),
      },
      { headers: cacheHeaders },
    );
  } catch {
    // Network error or timeout — assume not available
    return NextResponse.json(
      {
        available: false,
        month: next.month,
        year: next.year,
        url: next.url,
        checkedAt: new Date().toISOString(),
      },
      { headers: cacheHeaders },
    );
  }
}
