/**
 * Parse a Visa Bulletin HTML page into structured cutoff rows.
 *
 * The DOS Visa Bulletin contains two employment-based tables:
 * - Chart A: "FINAL ACTION DATES" (final_action)
 * - Chart B: "DATES FOR FILING" (dates_for_filing)
 *
 * Each table has columns for different countries/chargeability areas
 * and rows for each preference category (1st, 2nd, 3rd, Other Workers).
 */

import { parseDOSDate } from "./date-parser";
import type {
  BulletinParseResult,
  Category,
  ChartType,
  CountryBucket,
  ParsedCutoffRow,
} from "./types";

/** Map table row labels to canonical category names */
const CATEGORY_MAP: Record<string, Category> = {
  "1st": "EB1",
  "1ST": "EB1",
  "2nd": "EB2",
  "2ND": "EB2",
  "3rd": "EB3",
  "3RD": "EB3",
  "other workers": "Other_Workers",
  "OTHER WORKERS": "Other_Workers",
};

/** Column order in the employment-based tables (0-indexed, column 0 is category label) */
const COUNTRY_COLUMNS: CountryBucket[] = [
  "all_other",
  "china_mainland",
  "india",
  "mexico",
  "philippines",
];

/**
 * Extract the bulletin month from the HTML page title or heading.
 *
 * DOS Visa Bulletin pages typically have titles like:
 * "Visa Bulletin For March 2026"
 *
 * @returns ISO month string, e.g. "2026-03"
 */
export function extractBulletinMonth(html: string): string {
  const MONTH_NAMES: Record<string, string> = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  // Try matching "Visa Bulletin For <Month> <Year>" in title or headings
  const pattern =
    /visa\s+bulletin\s+for\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i;
  const match = html.match(pattern);

  if (!match) {
    throw new Error("Could not extract bulletin month from HTML");
  }

  const monthName = match[1].toLowerCase();
  const year = match[2];
  const monthNum = MONTH_NAMES[monthName];

  return `${year}-${monthNum}`;
}

/**
 * Minimal HTML table parser — extracts text content from table rows/cells.
 * Does not depend on any DOM library; uses regex-based extraction.
 */
function extractTables(html: string): string[][][] {
  const tables: string[][][] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1];
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch: RegExpExecArray | null;

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1];
      const cells: string[] = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch: RegExpExecArray | null;

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Strip HTML tags and decode basic entities, then trim
        const text = cellMatch[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&#\d+;/g, "")
          .trim();
        cells.push(text);
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    if (rows.length > 0) {
      tables.push(rows);
    }
  }

  return tables;
}

/**
 * Determine if a table is an employment-based preference table
 * by checking if it contains the expected category labels.
 */
function isEmploymentTable(table: string[][]): boolean {
  const allText = table.map((row) => row.join(" ").toLowerCase()).join(" ");
  return (
    (allText.includes("1st") || allText.includes("1ST")) &&
    (allText.includes("2nd") || allText.includes("2ND")) &&
    (allText.includes("3rd") || allText.includes("3RD"))
  );
}

/**
 * Identify the chart type based on surrounding HTML context.
 * Looks for "FINAL ACTION" or "DATES FOR FILING" near the table.
 */
function identifyChartType(
  html: string,
  tableIndex: number
): ChartType | null {
  // Find all table positions
  const tablePositions: number[] = [];
  const tableRegex = /<table[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(html)) !== null) {
    tablePositions.push(m.index);
  }

  if (tableIndex >= tablePositions.length) return null;

  const tablePos = tablePositions[tableIndex];
  // Look at the 2000 characters before this table for chart type indicators
  const precedingText = html
    .substring(Math.max(0, tablePos - 2000), tablePos)
    .toLowerCase();

  // Check which heading is closest (last one before the table)
  const finalActionIdx = precedingText.lastIndexOf("final action");
  const datesForFilingIdx = precedingText.lastIndexOf("dates for filing");

  if (finalActionIdx === -1 && datesForFilingIdx === -1) return null;
  if (finalActionIdx === -1) return "dates_for_filing";
  if (datesForFilingIdx === -1) return "final_action";

  // Whichever appears later (closer to the table) wins
  return finalActionIdx > datesForFilingIdx
    ? "final_action"
    : "dates_for_filing";
}

/**
 * Normalize a category label from the table to a canonical Category.
 */
function normalizeCategory(label: string): Category | null {
  const lower = label.toLowerCase().trim();
  // Direct map
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  if (CATEGORY_MAP[label.trim()]) return CATEGORY_MAP[label.trim()];

  // Partial matches
  if (lower.startsWith("1st") || lower.startsWith("1ST")) return "EB1";
  if (lower.startsWith("2nd") || lower.startsWith("2ND")) return "EB2";
  if (lower.startsWith("3rd") || lower.startsWith("3RD")) return "EB3";
  if (lower.includes("other worker")) return "Other_Workers";

  return null;
}

/**
 * Parse a single employment-based table into cutoff rows.
 */
function parseTable(
  table: string[][],
  chartType: ChartType,
  bulletinMonth: string
): ParsedCutoffRow[] {
  const rows: ParsedCutoffRow[] = [];

  for (const row of table) {
    if (row.length < 6) continue; // Need category + 5 country columns

    const category = normalizeCategory(row[0]);
    if (!category) continue;

    for (let colIdx = 0; colIdx < COUNTRY_COLUMNS.length; colIdx++) {
      const cellValue = row[colIdx + 1];
      if (!cellValue) continue;

      const countryBucket = COUNTRY_COLUMNS[colIdx];
      const parsed = parseDOSDate(cellValue);

      rows.push({
        bulletin_month: bulletinMonth,
        chart_type: chartType,
        category,
        country_bucket: countryBucket,
        cutoff_kind: parsed.kind,
        cutoff_date: parsed.kind === "date" ? parsed.date : null,
        original_value: cellValue,
      });
    }
  }

  return rows;
}

/**
 * Parse the employment-based tables from a Visa Bulletin HTML page for a
 * specific chart type (final_action or dates_for_filing).
 *
 * @param html - Full HTML of the Visa Bulletin page
 * @param chartType - Which chart to parse
 * @returns Array of parsed cutoff rows
 */
export function parseEmploymentTable(
  html: string,
  chartType: ChartType
): ParsedCutoffRow[] {
  const bulletinMonth = extractBulletinMonth(html);
  const tables = extractTables(html);

  const results: ParsedCutoffRow[] = [];

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    if (!isEmploymentTable(table)) continue;

    const detectedType = identifyChartType(html, i);
    if (detectedType !== chartType) continue;

    results.push(...parseTable(table, chartType, bulletinMonth));
  }

  return results;
}

/**
 * Parse a full Visa Bulletin HTML page, extracting both Chart A and Chart B.
 *
 * @param html - Full HTML of the Visa Bulletin page
 * @returns Complete parse result with bulletin month and all rows
 */
export function parseBulletin(html: string): BulletinParseResult {
  const bulletinMonth = extractBulletinMonth(html);

  const finalActionRows = parseEmploymentTable(html, "final_action");
  const datesForFilingRows = parseEmploymentTable(html, "dates_for_filing");

  return {
    bulletin_month: bulletinMonth,
    rows: [...finalActionRows, ...datesForFilingRows],
  };
}
