import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";
import type { PolicyUpdate } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock data - for development fallback
// ---------------------------------------------------------------------------

const mockPolicyUpdates: PolicyUpdate[] = [
  {
    id: "p0000001-0000-0000-0000-000000000001",
    topic: "USCIS Policy",
    subtopic: "Filing Charts",
    title: "USCIS Announces Chart Selection for March 2026",
    source_url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures",
    publisher: "USCIS",
    published_at: "2026-02-15T12:00:00.000Z",
    summary: "USCIS has determined that Dates for Filing chart can be used for March 2026.",
    why_it_matters: "Determines which chart applies for AOS applicants.",
    freshness_expires_at: "2026-04-01T00:00:00.000Z",
    source_type: "official",
    is_active: true,
    created_at: "2026-02-15T12:00:00.000Z",
  },
  {
    id: "p0000002-0000-0000-0000-000000000002",
    topic: "Policy Memo",
    subtopic: "Premium Processing",
    title: "Premium Processing Expansion for EB-1 and EB-2 NIW",
    source_url: "https://www.uscis.gov/newsroom",
    publisher: "USCIS",
    published_at: "2026-01-20T12:00:00.000Z",
    summary: "Premium processing is now available for additional employment-based categories.",
    why_it_matters: "Allows faster processing for more EB applicants.",
    freshness_expires_at: "2026-03-20T00:00:00.000Z",
    source_type: "official",
    is_active: true,
    created_at: "2026-01-20T12:00:00.000Z",
  },
  {
    id: "p0000003-0000-0000-0000-000000000003",
    topic: "Legislation",
    subtopic: "Country Cap Reform",
    title: "Country Cap Elimination Bill Reintroduced in Senate",
    source_url: "https://example.com/senate-bill",
    publisher: "Reuters",
    published_at: "2025-12-01T12:00:00.000Z",
    summary: "Bipartisan bill to eliminate per-country caps reintroduced.",
    why_it_matters: "Could dramatically reduce wait times for India and China EB applicants.",
    freshness_expires_at: "2026-02-01T00:00:00.000Z",
    source_type: "secondary",
    is_active: false,
    created_at: "2025-12-01T12:00:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// GET /api/admin/freshness
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const db = getAdminDb();
  if (db) {
    try {
      const snap = await db
        .collection("policy_updates")
        .orderBy("freshness_expires_at", "asc")
        .get();

      if (!snap.empty) {
        const updates = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PolicyUpdate[];

        return NextResponse.json({
          updates,
          _meta: {
            source: "firebase",
            generatedAt: new Date().toISOString(),
          },
        });
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Fallback to mock data
  return NextResponse.json({
    updates: mockPolicyUpdates,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
