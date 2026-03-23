/**
 * Types for the Visa Bulletin parser and ingestion pipeline.
 */

/** Chart type: Final Action Dates (Chart A) or Dates for Filing (Chart B) */
export type ChartType = "final_action" | "dates_for_filing";

/** Employment-based preference category */
export type Category = "EB1" | "EB2" | "EB3" | "Other_Workers";

/** Country/chargeability bucket */
export type CountryBucket =
  | "all_other"
  | "china_mainland"
  | "india"
  | "mexico"
  | "philippines";

/** Whether the cutoff value is a date, "current", or "unavailable" */
export type CutoffKind = "date" | "current" | "unavailable";

/** Raw parsed cutoff value before normalization */
export type RawCutoffValue =
  | { kind: "date"; date: string } // ISO date string e.g. "2013-09-15"
  | { kind: "current" }
  | { kind: "unavailable" };

/** A single parsed row from the Visa Bulletin */
export interface ParsedCutoffRow {
  bulletin_month: string; // e.g. "2026-03"
  chart_type: ChartType;
  category: Category;
  country_bucket: CountryBucket;
  cutoff_kind: CutoffKind;
  cutoff_date: string | null; // ISO date or null for C/U
  original_value: string; // original text from source
}

/** Result of parsing a full Visa Bulletin page */
export interface BulletinParseResult {
  bulletin_month: string;
  rows: ParsedCutoffRow[];
}

/** Movement direction between months */
export type MovementDirection = "forward" | "backward" | "unchanged";

/** Derived monthly movement between two cutoff rows */
export interface DerivedMovement {
  movement_days: number | null; // null when comparison is not meaningful
  movement_direction: MovementDirection;
  is_retrogression: boolean;
  is_no_change: boolean;
}
