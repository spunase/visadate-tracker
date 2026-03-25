import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";

// ---------------------------------------------------------------------------
// POST /api/admin/toggle-content
// Body: { id: string, is_active: boolean }
// ---------------------------------------------------------------------------

const ToggleContentSchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
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

    if (!supabaseAdmin) {
      // In mock mode, just acknowledge the toggle
      return NextResponse.json({
        success: true,
        id,
        is_active,
        _meta: {
          source: "mock",
          note: "No Supabase service role key configured. Toggle acknowledged but not persisted.",
          generatedAt: new Date().toISOString(),
        },
      });
    }

    const { data, error } = await supabaseAdmin
      .from("policy_updates")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update policy_updates",
          ...(process.env.NODE_ENV === "development" && { message: error.message }),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data,
      _meta: {
        source: "supabase",
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
