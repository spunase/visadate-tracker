import { NextResponse } from "next/server";
import type { VisaBulletin, VisaCutoffRow } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock data — March 2026 visa bulletin
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
  // ---- Final Action Dates ----
  // EB1
  { id: "c0000001-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2022-02-01", original_value: "01FEB22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2022-06-01", original_value: "01JUN22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000001-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB1", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB2
  { id: "c0000002-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2012-09-01", original_value: "01SEP12", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2020-12-01", original_value: "01DEC20", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000002-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB2", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB3
  { id: "c0000003-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2012-06-08", original_value: "08JUN12", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2020-01-01", original_value: "01JAN20", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000003-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "final_action", category: "EB3", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },

  // ---- Dates for Filing ----
  // EB1
  { id: "c0000004-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2022-08-01", original_value: "01AUG22", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2023-01-01", original_value: "01JAN23", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000004-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB1", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB2
  { id: "c0000005-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2013-06-01", original_value: "01JUN13", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2021-06-01", original_value: "01JUN21", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000005-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB2", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
  // EB3
  { id: "c0000006-0001-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "india",          cutoff_kind: "date", cutoff_date: "2013-01-01", original_value: "01JAN13", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0002-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "china_mainland",  cutoff_kind: "date", cutoff_date: "2020-09-01", original_value: "01SEP20", created_at: "2026-02-12T18:00:00.000Z" },
  { id: "c0000006-0003-0000-0000-000000000001", bulletin_id: BULLETIN_ID, chart_type: "dates_for_filing", category: "EB3", country_bucket: "all_other",       cutoff_kind: "current", cutoff_date: null, original_value: "C", created_at: "2026-02-12T18:00:00.000Z" },
];

// ---------------------------------------------------------------------------
// GET /api/bulletin/current
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({
    bulletin: mockBulletin,
    cutoffRows: mockCutoffRows,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
