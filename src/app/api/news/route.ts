import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { PolicyUpdate } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock policy updates — realistic H-1B / EB immigration news (fallback)
// ---------------------------------------------------------------------------

const mockUpdates: PolicyUpdate[] = [
  {
    id: "pu000001-0000-0000-0000-000000000001",
    topic: "H-1B",
    subtopic: "Registration",
    title: "USCIS Announces FY 2027 H-1B Registration Period Opens March 7",
    source_url:
      "https://www.uscis.gov/newsroom/alerts/uscis-announces-h-1b-registration",
    publisher: "USCIS",
    published_at: "2026-02-28T14:00:00.000Z",
    summary:
      "USCIS has announced that the FY 2027 H-1B electronic registration period will open on March 7, 2026, and close on March 24, 2026. The registration fee remains at $215 per beneficiary.",
    why_it_matters:
      "If you plan to sponsor or be sponsored for an H-1B for FY 2027 (starting October 1, 2026), your employer must complete electronic registration during this window. Missing it means waiting another year.",
    freshness_expires_at: "2026-03-25T00:00:00.000Z",
    source_type: "official",
    is_active: true,
    created_at: "2026-02-28T15:00:00.000Z",
  },
  {
    id: "pu000002-0000-0000-0000-000000000002",
    topic: "Employment-Based Green Card",
    subtopic: "EB-2 India",
    title:
      "EB-2 India Final Action Date Advances 31 Days in March 2026 Bulletin",
    source_url:
      "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html",
    publisher: "Department of State",
    published_at: "2026-02-12T17:00:00.000Z",
    summary:
      "The March 2026 visa bulletin shows the EB-2 India Final Action date moving forward to September 1, 2012, a 31-day advancement from the prior month. The Dates for Filing chart advanced to June 1, 2013.",
    why_it_matters:
      "Consistent forward movement is a positive signal for EB-2 India applicants. If your priority date is before September 2012, you may now be eligible to have your I-485 adjudicated.",
    freshness_expires_at: "2026-04-15T00:00:00.000Z",
    source_type: "official",
    is_active: true,
    created_at: "2026-02-12T18:00:00.000Z",
  },
  {
    id: "pu000003-0000-0000-0000-000000000003",
    topic: "Employment-Based Green Card",
    subtopic: "Country Caps",
    title:
      "Bipartisan Bill Reintroduced to Eliminate Per-Country Green Card Caps",
    source_url: "https://example.com/congress-bill-country-caps-2026",
    publisher: "Reuters",
    published_at: "2026-02-20T10:00:00.000Z",
    summary:
      "A bipartisan group of senators has reintroduced legislation to phase out per-country caps on employment-based green cards over a 9-year transition period. The bill has 12 co-sponsors.",
    why_it_matters:
      "If enacted, this would dramatically reduce wait times for applicants from India and China. Previous versions of this bill have passed one chamber but stalled. Track its progress but do not make immigration decisions based on pending legislation.",
    freshness_expires_at: "2026-06-20T00:00:00.000Z",
    source_type: "secondary",
    is_active: true,
    created_at: "2026-02-20T12:00:00.000Z",
  },
  {
    id: "pu000004-0000-0000-0000-000000000004",
    topic: "USCIS Processing",
    subtopic: "I-485",
    title:
      "USCIS Updates Processing Times: I-485 EB Average Now 14.5 Months",
    source_url: "https://egov.uscis.gov/processing-times/",
    publisher: "USCIS",
    published_at: "2026-03-01T09:00:00.000Z",
    summary:
      "Updated USCIS processing time data shows the median I-485 employment-based processing time at 14.5 months at the National Benefits Center. The Nebraska Service Center averages 12 months for I-140 EB-2/EB-3.",
    why_it_matters:
      "Once your priority date becomes current and you file I-485, expect roughly 12-15 months for adjudication. Factor this into your overall timeline planning.",
    freshness_expires_at: "2026-04-01T00:00:00.000Z",
    source_type: "official",
    is_active: true,
    created_at: "2026-03-01T10:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// GET /api/news
// ---------------------------------------------------------------------------

export async function GET() {
  // --- Try Supabase first ---
  if (supabase) {
    try {
      const { data: updates, error } = await supabase
        .from("policy_updates")
        .select("*")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(20);

      if (!error && updates && updates.length > 0) {
        return NextResponse.json({
          news: updates as PolicyUpdate[],
          count: updates.length,
          _meta: {
            source: "supabase",
            generatedAt: new Date().toISOString(),
          },
        });
      }

      if (error) {
        console.warn("Supabase news query failed, using mock fallback:", error.message);
      }
    } catch (err) {
      console.error("Supabase error in /api/news:", err);
    }
  }

  // --- Fallback to mock data ---
  return NextResponse.json({
    news: mockUpdates,
    count: mockUpdates.length,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
