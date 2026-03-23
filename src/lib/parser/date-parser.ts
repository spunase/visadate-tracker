/**
 * Parse DOS-format dates from Visa Bulletin tables.
 *
 * DOS format: DDMMMYY (e.g., "15SEP13" → 2013-09-15)
 * Special values: "C" (current), "U" (unavailable)
 */

import type { RawCutoffValue } from "./types";

const MONTH_MAP: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
};

/**
 * Parse a two-digit year into a four-digit year.
 * 00-30 → 2000-2030, 31-99 → 1931-1999
 */
function expandYear(twoDigit: string): string {
  const num = parseInt(twoDigit, 10);
  const fullYear = num <= 30 ? 2000 + num : 1900 + num;
  return String(fullYear);
}

/**
 * Parse a DOS-format date string or symbolic value.
 *
 * @param value - Raw string from the Visa Bulletin table cell
 * @returns Parsed cutoff value
 * @throws Error if the value cannot be parsed
 *
 * @example
 * parseDOSDate("15SEP13") // { kind: "date", date: "2013-09-15" }
 * parseDOSDate("C")       // { kind: "current" }
 * parseDOSDate("U")       // { kind: "unavailable" }
 */
export function parseDOSDate(value: string): RawCutoffValue {
  const trimmed = value.trim().toUpperCase();

  if (trimmed === "C" || trimmed === "CURRENT") {
    return { kind: "current" };
  }

  if (trimmed === "U" || trimmed === "UNAVAILABLE") {
    return { kind: "unavailable" };
  }

  // DOS date format: DDMMMYY (e.g., 15SEP13)
  const match = trimmed.match(/^(\d{1,2})([A-Z]{3})(\d{2})$/);
  if (!match) {
    throw new Error(`Unable to parse DOS date value: "${value}"`);
  }

  const [, dayStr, monthAbbr, yearStr] = match;
  const monthNum = MONTH_MAP[monthAbbr];
  if (!monthNum) {
    throw new Error(`Unknown month abbreviation: "${monthAbbr}" in "${value}"`);
  }

  const day = dayStr.padStart(2, "0");
  const year = expandYear(yearStr);

  return { kind: "date", date: `${year}-${monthNum}-${day}` };
}
