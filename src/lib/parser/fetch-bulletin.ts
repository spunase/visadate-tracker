/**
 * Fetch Visa Bulletin HTML from the Department of State website.
 *
 * URL pattern:
 * https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/{year}/visa-bulletin-for-{month}-{year}.html
 */

const BASE_URL =
  "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export interface FetchBulletinResult {
  html: string;
  url: string;
  fetchedAt: string; // ISO 8601
}

/**
 * Build the DOS Visa Bulletin URL for a given year and month.
 *
 * @param year - Four-digit year (e.g. 2026)
 * @param month - 1-based month number (1 = January)
 */
function buildBulletinUrl(year: number, month: number): string {
  const monthName = MONTH_NAMES[month - 1];
  if (!monthName) {
    throw new Error(`Invalid month number: ${month}`);
  }
  return `${BASE_URL}/${year}/visa-bulletin-for-${monthName}-${year}.html`;
}

/**
 * Fetch the Visa Bulletin page for a specific month/year.
 *
 * @param year - Four-digit year
 * @param month - 1-based month number
 * @returns The fetched HTML, URL, and timestamp, or null on failure
 */
export async function fetchBulletinForMonth(
  year: number,
  month: number
): Promise<FetchBulletinResult | null> {
  try {
    const url = buildBulletinUrl(year, month);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "VisaDateTracker/1.0 (bulletin-ingestion; contact: admin@visadatetracker.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch bulletin: HTTP ${response.status} for ${url}`
      );
      return null;
    }

    const html = await response.text();

    if (!html || html.length < 500) {
      console.error(`Fetched page appears too short (${html.length} chars)`);
      return null;
    }

    return {
      html,
      url,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "Error fetching bulletin:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Fetch the latest Visa Bulletin (current month).
 *
 * Tries the current month first, then falls back to the previous month
 * in case the current month's bulletin hasn't been published yet.
 *
 * @returns The fetched HTML, URL, and timestamp, or null on failure
 */
export async function fetchLatestBulletin(): Promise<FetchBulletinResult | null> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based

  // Try current month first
  const current = await fetchBulletinForMonth(year, month);
  if (current) return current;

  // Fall back to previous month
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  return fetchBulletinForMonth(prevYear, prevMonth);
}
