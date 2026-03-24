import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ---------------------------------------------------------------------------
// POST /api/admin/toggle-content
// Body: { id: string, is_active: boolean }
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id (string), is_active (boolean)",
        },
        { status: 400 }
      );
    }

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
      console.error("Supabase toggle error:", error.message);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update policy_updates",
          message: error.message,
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
  } catch (err) {
    console.error("Error in /api/admin/toggle-content:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
