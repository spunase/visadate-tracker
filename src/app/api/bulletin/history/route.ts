import { NextRequest, NextResponse } from "next/server";
import type { Category, CountryBucket, ChartType } from "@/types/database";

// ---------------------------------------------------------------------------
// 12-month mock history for EB2 India Final Action
// Realistic pattern: mostly forward, some flat, one retrogression
// ---------------------------------------------------------------------------

interface HistoryRow {
  bulletin_month: string;
  cutoff_date: string;
  original_value: string;
  movement_days: number;
  movement_direction: "forward" | "backward" | "unchanged";
}

const EB2_INDIA_FINAL_ACTION_HISTORY: HistoryRow[] = [
  { bulletin_month: "2025-04", cutoff_date: "2012-01-08", original_value: "08JAN12", movement_days: 0,    movement_direction: "unchanged" },
  { bulletin_month: "2025-05", cutoff_date: "2012-01-22", original_value: "22JAN12", movement_days: 14,   movement_direction: "forward" },
  { bulletin_month: "2025-06", cutoff_date: "2012-02-15", original_value: "15FEB12", movement_days: 24,   movement_direction: "forward" },
  { bulletin_month: "2025-07", cutoff_date: "2012-03-01", original_value: "01MAR12", movement_days: 14,   movement_direction: "forward" },
  { bulletin_month: "2025-08", cutoff_date: "2012-03-01", original_value: "01MAR12", movement_days: 0,    movement_direction: "unchanged" },
  { bulletin_month: "2025-09", cutoff_date: "2012-04-08", original_value: "08APR12", movement_days: 38,   movement_direction: "forward" },
  { bulletin_month: "2025-10", cutoff_date: "2012-05-01", original_value: "01MAY12", movement_days: 23,   movement_direction: "forward" },
  { bulletin_month: "2025-11", cutoff_date: "2012-04-15", original_value: "15APR12", movement_days: -16,  movement_direction: "backward" },
  { bulletin_month: "2025-12", cutoff_date: "2012-05-22", original_value: "22MAY12", movement_days: 37,   movement_direction: "forward" },
  { bulletin_month: "2026-01", cutoff_date: "2012-07-01", original_value: "01JUL12", movement_days: 40,   movement_direction: "forward" },
  { bulletin_month: "2026-02", cutoff_date: "2012-08-01", original_value: "01AUG12", movement_days: 31,   movement_direction: "forward" },
  { bulletin_month: "2026-03", cutoff_date: "2012-09-01", original_value: "01SEP12", movement_days: 31,   movement_direction: "forward" },
];

// ---------------------------------------------------------------------------
// GET /api/bulletin/history?category=EB2&country=india&chart_type=final_action
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = (searchParams.get("category") ?? "EB2") as Category;
  const country = (searchParams.get("country") ?? "india") as CountryBucket;
  const chartType = (searchParams.get("chart_type") ?? "final_action") as ChartType;

  // For the mock, we only have EB2 / india / final_action history.
  // Return it regardless of params but tag the response with the requested filters.
  const rows = EB2_INDIA_FINAL_ACTION_HISTORY.map((row) => ({
    ...row,
    category,
    country_bucket: country,
    chart_type: chartType,
  }));

  return NextResponse.json({
    filters: { category, country, chart_type: chartType },
    months: rows.length,
    history: rows,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
