import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Category, CountryBucket, ChartType } from "@/types/database";

// ---------------------------------------------------------------------------
// 12-month mock history for EB2 India Final Action (fallback)
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
  { bulletin_month: "2026-03", cutoff_date: "2013-09-15", original_value: "15SEP13", movement_days: 411,  movement_direction: "forward" },
];

// ---------------------------------------------------------------------------
// GET /api/bulletin/history?category=EB2&country=india&chart_type=final_action
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = (searchParams.get("category") ?? "EB2") as Category;
  const country = (searchParams.get("country") ?? "india") as CountryBucket;
  const chartType = (searchParams.get("chart_type") ?? "final_action") as ChartType;

  // --- Try Supabase first ---
  if (supabase) {
    try {
      // Join visa_cutoff_rows with visa_bulletins via bulletin_id,
      // filter by category, country_bucket, chart_type,
      // order by bulletin_month DESC, limit 24.
      const { data: rows, error } = await supabase
        .from("visa_cutoff_rows")
        .select(`
          bulletin_id,
          chart_type,
          category,
          country_bucket,
          cutoff_kind,
          cutoff_date,
          original_value,
          visa_bulletins!inner ( bulletin_month )
        `)
        .eq("category", category)
        .eq("country_bucket", country)
        .eq("chart_type", chartType)
        .order("visa_bulletins(bulletin_month)", { ascending: false })
        .limit(24);

      if (!error && rows && rows.length > 0) {
        // Enrich with movement data from derived_monthly_movements
        const bulletinMonths = rows.map((r: Record<string, unknown>) => {
          const vb = r.visa_bulletins as Record<string, unknown> | Record<string, unknown>[];
          return Array.isArray(vb) ? vb[0]?.bulletin_month : vb?.bulletin_month;
        }).filter(Boolean) as string[];

        // Fetch movements for these months
        const { data: movements } = await supabase
          .from("derived_monthly_movements")
          .select("bulletin_month, movement_days, movement_direction")
          .eq("category", category)
          .eq("country_bucket", country)
          .eq("chart_type", chartType)
          .in("bulletin_month", bulletinMonths);

        const movementMap = new Map<string, { movement_days: number; movement_direction: string }>();
        if (movements) {
          for (const m of movements) {
            movementMap.set(m.bulletin_month, {
              movement_days: m.movement_days,
              movement_direction: m.movement_direction,
            });
          }
        }

        const history = rows.map((r: Record<string, unknown>) => {
          const vb = r.visa_bulletins as Record<string, unknown> | Record<string, unknown>[];
          const bulletinMonth = (Array.isArray(vb) ? vb[0]?.bulletin_month : vb?.bulletin_month) as string;
          const mov = movementMap.get(bulletinMonth);
          return {
            bulletin_month: bulletinMonth,
            cutoff_date: r.cutoff_date as string,
            original_value: r.original_value as string,
            movement_days: mov?.movement_days ?? 0,
            movement_direction: mov?.movement_direction ?? "unchanged",
            category,
            country_bucket: country,
            chart_type: chartType,
          };
        });

        return NextResponse.json({
          filters: { category, country, chart_type: chartType },
          months: history.length,
          history,
          _meta: {
            source: "supabase",
            generatedAt: new Date().toISOString(),
          },
        });
      }

      if (error) {
        console.warn("Supabase history query failed, using mock fallback:", error.message);
      }
    } catch (err) {
      console.error("Supabase error in /api/bulletin/history:", err);
    }
  }

  // --- Fallback to mock data ---
  // Mock only has EB2 / india / final_action history.
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
