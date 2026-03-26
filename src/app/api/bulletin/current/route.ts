import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { VisaBulletin, VisaCutoffRow } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock data - March 2026 visa bulletin (fallback)
// ---------------------------------------------------------------------------

const BULLETIN_ID = "b0000001-0000-0000-0000-000000000001";

const mockBulletin: VisaBulletin = {
  id: BULLETIN_ID,
  bulletin_month: "2026-03",
  source_url:
    "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html",
  source_published_at: "2026-02-12T17:00:00.000Z",
  raw_snapshot_path: null,
  validation_status: "published",
  validated_at: "2026-02-13T02:30:00.000Z",
  created_at: "2026-02-12T18:00:00.000Z",
};

const mockCutoffRows: VisaCutoffRow[] = [
  // ---- Final Action Dates (Chart A) ----
  // Source: https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html
  // EB1
  { id: "c0000001-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2023-03-01", original_value: "01MAR23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2023-03-01", original_value: "01MAR23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "mexico",         cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "philippines",    cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB2
  { id: "c0000002-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "all_other",       cutoff_kind: "date", cutoff_date: "2024-10-15", original_value: "15OCT24", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2021-09-01", original_value: "01SEP21", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2013-09-15", original_value: "15SEP13", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "mexico",         cutoff_kind: "date", cutoff_date: "2024-10-15", original_value: "15OCT24", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "philippines",    cutoff_kind: "date", cutoff_date: "2024-10-15", original_value: "15OCT24", created_at: "2026-02-12T18:00:00.000Z" },
  // EB3
  { id: "c0000003-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "all_other",       cutoff_kind: "date", cutoff_date: "2023-10-01", original_value: "01OCT23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2021-05-01", original_value: "01MAY21", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2013-11-15", original_value: "15NOV13", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "mexico",         cutoff_kind: "date", cutoff_date: "2023-10-01", original_value: "01OCT23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "philippines",    cutoff_kind: "date", cutoff_date: "2023-08-01", original_value: "01AUG23", created_at: "2026-02-12T18:00:00.000Z" },
  // Other Workers
  { id: "c0000003-0006-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "Other_Workers", country_bucket: "all_other",       cutoff_kind: "date", cutoff_date: "2021-11-01", original_value: "01NOV21", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0007-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "Other_Workers", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2018-12-08", original_value: "08DEC18", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0008-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "Other_Workers", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2013-11-15", original_value: "15NOV13", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0009-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "Other_Workers", country_bucket: "mexico",         cutoff_kind: "date", cutoff_date: "2021-11-01", original_value: "01NOV21", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0010-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "Other_Workers", country_bucket: "philippines",    cutoff_kind: "date", cutoff_date: "2021-11-01", original_value: "01NOV21", created_at: "2026-02-12T18:00:00.000Z" },

  // ---- Dates for Filing (Chart B) ----
  // EB1
  { id: "c0000004-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2023-12-01", original_value: "01DEC23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2023-12-01", original_value: "01DEC23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "mexico",         cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "philippines",    cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB2
  { id: "c0000005-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2022-01-01", original_value: "01JAN22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2014-11-01", original_value: "01NOV14", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "mexico",         cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "philippines",    cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB3
  { id: "c0000006-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "all_other",       cutoff_kind: "date", cutoff_date: "2024-01-15", original_value: "15JAN24", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2022-01-01", original_value: "01JAN22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2014-08-15", original_value: "15AUG14", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0004-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "mexico",         cutoff_kind: "date", cutoff_date: "2024-01-15", original_value: "15JAN24", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0005-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "philippines",    cutoff_kind: "date", cutoff_date: "2024-01-01", original_value: "01JAN24", created_at: "2026-02-12T18:00:00.000Z" },
  // Other Workers
  { id: "c0000006-0006-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "Other_Workers", country_bucket: "all_other",       cutoff_kind: "date", cutoff_date: "2022-06-22", original_value: "22JUN22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0007-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "Other_Workers", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2019-10-01", original_value: "01OCT19", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0008-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "Other_Workers", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2014-08-15", original_value: "15AUG14", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0009-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "Other_Workers", country_bucket: "mexico",         cutoff_kind: "date", cutoff_date: "2022-06-22", original_value: "22JUN22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0010-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "Other_Workers", country_bucket: "philippines",    cutoff_kind: "date", cutoff_date: "2022-06-22", original_value: "22JUN22", created_at: "2026-02-12T18:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// GET /api/bulletin/current
// ---------------------------------------------------------------------------

export async function GET() {
  const cacheHeaders = {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  };

  // --- Try Supabase first ---
  if (supabase) {
    try {
      // Fetch most recent published bulletin
      const { data: bulletin, error: bulletinError } = await supabase
        .from("visa_bulletins")
        .select("*")
        .eq("validation_status", "published")
        .order("bulletin_month", { ascending: false })
        .limit(1)
        .single();

      if (bulletinError || !bulletin) {
        // No published bulletin in DB - fall through to mock
      } else {
        // Fetch cutoff rows for this bulletin
        const { data: cutoffRows, error: cutoffError } = await supabase
          .from("visa_cutoff_rows")
          .select("*")
          .eq("bulletin_id", bulletin.id);

        if (!cutoffError) {
          return NextResponse.json(
            {
              bulletin: bulletin as VisaBulletin,
              cutoffRows: (cutoffRows ?? []) as VisaCutoffRow[],
              _meta: {
                source: "supabase",
                generatedAt: new Date().toISOString(),
              },
            },
            { headers: cacheHeaders },
          );
        }
      }
    } catch {
      // Fall through to mock data
    }
  }

  // --- Fallback to mock data ---
  return NextResponse.json(
    {
      bulletin: mockBulletin,
      cutoffRows: mockCutoffRows,
      _meta: {
        source: "mock",
        generatedAt: new Date().toISOString(),
      },
    },
    { headers: cacheHeaders },
  );
}
