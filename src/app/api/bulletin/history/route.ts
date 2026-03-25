import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Category, CountryBucket, ChartType } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock history generator (fallback when Supabase has no data)
// Generates realistic 12-month movement patterns per category/country.
// ---------------------------------------------------------------------------

interface HistoryRow {
  bulletin_month: string;
  cutoff_date: string;
  original_value: string;
  movement_days: number;
  movement_direction: "forward" | "backward" | "unchanged";
}

/**
 * Approximate starting cutoff dates by category+country for March 2026.
 * Used to seed backwards from the current month to generate 12 months of
 * realistic-looking history. These are approximate and for mock purposes only.
 */
const BASE_DATES: Record<string, string> = {
  // Employment-Based
  "EB1_india": "2023-03-01", "EB2_india": "2013-09-15", "EB3_india": "2013-11-15",
  "EB1_china": "2023-02-22", "EB2_china": "2021-04-08", "EB3_china": "2020-09-01",
  "EB1_philippines": "2026-03-01", "EB2_philippines": "2026-03-01", "EB3_philippines": "2021-11-22",
  "EB1_mexico": "2026-03-01", "EB2_mexico": "2026-03-01", "EB3_mexico": "2021-12-01",
  "EB1_all_other": "2026-03-01", "EB2_all_other": "2024-10-15", "EB3_all_other": "2023-01-08",
  // Family-Based
  "F1_india": "2016-01-01", "F2A_india": "2021-09-01", "F2B_india": "2012-01-01",
  "F3_india": "2008-10-01", "F4_india": "2006-04-15",
  "F1_china": "2016-01-01", "F2A_china": "2021-09-01", "F2B_china": "2017-06-08",
  "F3_china": "2008-06-01", "F4_china": "2007-01-01",
  "F1_philippines": "2013-04-01", "F2A_philippines": "2021-09-01", "F2B_philippines": "2012-10-22",
  "F3_philippines": "2002-11-22", "F4_philippines": "2004-03-22",
  "F1_mexico": "2002-04-01", "F2A_mexico": "2021-06-01", "F2B_mexico": "2006-07-01",
  "F3_mexico": "2000-11-15", "F4_mexico": "2001-03-01",
  "F1_all_other": "2016-01-01", "F2A_all_other": "2021-09-01", "F2B_all_other": "2017-09-22",
  "F3_all_other": "2008-11-08", "F4_all_other": "2007-03-22",
};

/** Seeded pseudo-random for deterministic mock data per category/country. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateMockHistory(category: string, country: string, chartType: string): HistoryRow[] {
  const key = `${category}_${country}`;
  const baseDate = BASE_DATES[key];

  // For "current" categories (no backlog), return flat history
  if (!baseDate || baseDate === "2026-03-01") {
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2025, 3 + i); // April 2025 through March 2026
      return {
        bulletin_month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
        cutoff_date: "current",
        original_value: "C",
        movement_days: 0,
        movement_direction: "unchanged" as const,
      };
    });
  }

  const rand = seededRandom(hashString(key + chartType));
  const endDate = new Date(baseDate + "T00:00:00");
  const rows: HistoryRow[] = [];

  // Work backwards from the end date to generate 12 months of history
  let currentDate = new Date(endDate);
  const monthEntries: { month: Date; cutoff: Date }[] = [];

  for (let i = 11; i >= 0; i--) {
    const bulletinMonth = new Date(2025, 3 + i); // April 2025 → March 2026
    monthEntries.unshift({ month: bulletinMonth, cutoff: new Date(currentDate) });

    // Move cutoff date backwards for earlier months
    const r = rand();
    if (r < 0.1) {
      // 10% chance: retrogression (move cutoff forward = earlier month had a later date)
      currentDate.setDate(currentDate.getDate() + Math.floor(rand() * 20 + 5));
    } else if (r < 0.25) {
      // 15% chance: no change
    } else {
      // 75% chance: forward movement (move cutoff backward = earlier month had an earlier date)
      currentDate.setDate(currentDate.getDate() - Math.floor(rand() * 45 + 7));
    }
  }

  for (let i = 0; i < monthEntries.length; i++) {
    const { month, cutoff } = monthEntries[i];
    const prevCutoff = i > 0 ? monthEntries[i - 1].cutoff : cutoff;
    const diffMs = cutoff.getTime() - prevCutoff.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const direction: HistoryRow["movement_direction"] =
      diffDays > 0 ? "forward" : diffDays < 0 ? "backward" : "unchanged";

    const dateStr = cutoff.toISOString().split("T")[0];
    const d = cutoff;
    const monthNames = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const originalValue = `${String(d.getDate()).padStart(2, "0")}${monthNames[d.getMonth()]}${String(d.getFullYear()).slice(2)}`;

    rows.push({
      bulletin_month: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
      cutoff_date: dateStr,
      original_value: originalValue,
      movement_days: i === 0 ? 0 : diffDays,
      movement_direction: i === 0 ? "unchanged" : direction,
    });
  }

  return rows;
}

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
  // Generate realistic history based on the requested filters.
  const mockHistory = generateMockHistory(category, country, chartType);
  const rows = mockHistory.map((row) => ({
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
