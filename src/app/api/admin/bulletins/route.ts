import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";
import type { VisaBulletin } from "@/types/database";

// ---------------------------------------------------------------------------
// Mock data - for development fallback
// ---------------------------------------------------------------------------

const BULLETIN_ID_1 = "b0000001-0000-0000-0000-000000000001";
const BULLETIN_ID_2 = "b0000002-0000-0000-0000-000000000002";

const mockBulletins: (VisaBulletin & { cutoff_count: number })[] = [
  {
    id: BULLETIN_ID_1,
    bulletin_month: "2026-03",
    source_url:
      "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html",
    source_published_at: "2026-02-12T17:00:00.000Z",
    raw_snapshot_path: null,
    validation_status: "published",
    validated_at: "2026-02-13T02:30:00.000Z",
    created_at: "2026-02-12T18:00:00.000Z",
    cutoff_count: 18,
  },
  {
    id: BULLETIN_ID_2,
    bulletin_month: "2026-02",
    source_url:
      "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-february-2026.html",
    source_published_at: "2026-01-10T17:00:00.000Z",
    raw_snapshot_path: null,
    validation_status: "superseded",
    validated_at: "2026-01-11T02:30:00.000Z",
    created_at: "2026-01-10T18:00:00.000Z",
    cutoff_count: 18,
  },
];

// ---------------------------------------------------------------------------
// GET /api/admin/bulletins
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const db = getAdminDb();
  if (db) {
    try {
      // Fetch all bulletins ordered by month descending
      const bulletinSnap = await db
        .collection("visa_bulletins")
        .orderBy("bulletin_month", "desc")
        .get();

      if (!bulletinSnap.empty) {
        const bulletins = bulletinSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as VisaBulletin[];

        // Count cutoff rows per bulletin
        const cutoffSnap = await db
          .collection("visa_cutoff_rows")
          .select("bulletin_id")
          .get();

        const countMap: Record<string, number> = {};
        for (const doc of cutoffSnap.docs) {
          const bId = doc.data().bulletin_id as string | undefined;
          if (bId) {
            countMap[bId] = (countMap[bId] ?? 0) + 1;
          }
        }

        const enriched = bulletins.map((b) => ({
          ...b,
          cutoff_count: countMap[b.id] ?? 0,
        }));

        return NextResponse.json({
          bulletins: enriched,
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
    bulletins: mockBulletins,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
