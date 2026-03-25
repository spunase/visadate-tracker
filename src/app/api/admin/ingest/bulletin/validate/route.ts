/**
 * POST /api/admin/ingest/bulletin/validate
 *
 * Change a bulletin's validation_status.
 *
 * Valid transitions:
 *   draft → validated
 *   validated → published
 *   published → superseded
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";
import type { ValidationStatus } from "@/types/database";

const ValidateRequestSchema = z.object({
  bulletinId: z.string().uuid(),
  status: z.enum(["validated", "published", "superseded"]),
});

/** Allowed status transitions: from → allowed next statuses */
const VALID_TRANSITIONS: Record<ValidationStatus, ValidationStatus[]> = {
  draft: ["validated"],
  validated: ["published"],
  published: ["superseded"],
  superseded: [],
};

export async function POST(request: Request) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
          message: "Supabase admin client is not configured.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = ValidateRequestSchema.parse(body);

    // Look up the current bulletin
    const { data: bulletin, error: lookupError } = await supabaseAdmin
      .from("visa_bulletins")
      .select("id, validation_status")
      .eq("id", validated.bulletinId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          ...(process.env.NODE_ENV === "development" && { message: lookupError.message }),
        },
        { status: 503 }
      );
    }

    if (!bulletin) {
      return NextResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No bulletin found with id: ${validated.bulletinId}`,
        },
        { status: 404 }
      );
    }

    // Check valid transition
    const currentStatus = bulletin.validation_status as ValidationStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNext.includes(validated.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transition",
          message: `Cannot transition from '${currentStatus}' to '${validated.status}'. Allowed transitions from '${currentStatus}': ${allowedNext.length > 0 ? allowedNext.join(", ") : "none"}.`,
        },
        { status: 409 }
      );
    }

    // Perform the update
    const updateData: Record<string, unknown> = {
      validation_status: validated.status,
    };

    // Set validated_at timestamp when transitioning to validated
    if (validated.status === "validated") {
      updateData.validated_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("visa_bulletins")
      .update(updateData)
      .eq("id", validated.bulletinId)
      .select("id, bulletin_month, validation_status, validated_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          ...(process.env.NODE_ENV === "development" && { message: updateError.message }),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      bulletin: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
