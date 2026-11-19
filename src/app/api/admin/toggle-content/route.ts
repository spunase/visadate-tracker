import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// POST /api/admin/toggle-content
// Body: { id: string, is_active: boolean }
// ---------------------------------------------------------------------------

const ToggleContentSchema = z.object({
  id: z.string().min(1, "id is required"),
  is_active: z.boolean(),
});

export async function POST(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = ToggleContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { id, is_active } = parsed.data;
    const db = getAdminDb();

    if (!db) {
      // In mock mode, just acknowledge the toggle
      return NextResponse.json({
        success: true,
        id,
        is_active,
        _meta: {
          source: "mock",
          note: "No Firebase Admin credentials configured. Toggle acknowledged but not persisted.",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const docRef = db.collection("policy_updates").doc(id);
    const existing = await docRef.get();
    if (!existing.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Policy update not found",
        },
        { status: 404 }
      );
    }

    await docRef.update({ is_active });
    const updatedSnap = await docRef.get();

    return NextResponse.json({
      success: true,
      updated: { id: updatedSnap.id, ...updatedSnap.data() },
      _meta: {
        source: "firebase",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
