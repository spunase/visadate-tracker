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
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdminAuth } from "@/lib/admin-auth";
import type { ValidationStatus } from "@/types/database";

const ValidateRequestSchema = z.object({
  bulletinId: z.string().min(1),
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
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
          message: "Firebase Admin Firestore is not configured.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = ValidateRequestSchema.parse(body);

    const docRef = db.collection("visa_bulletins").doc(validated.bulletinId);
    const bulletinSnap = await docRef.get();

    if (!bulletinSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Not found",
          message: `No bulletin found with id: ${validated.bulletinId}`,
        },
        { status: 404 }
      );
    }

    const bulletin = bulletinSnap.data() ?? {};

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

    await docRef.update(updateData);
    const updatedSnap = await docRef.get();
    const updatedData = updatedSnap.data() ?? {};

    return NextResponse.json({
      success: true,
      bulletin: {
        id: updatedSnap.id,
        bulletin_month: updatedData.bulletin_month,
        validation_status: updatedData.validation_status,
        validated_at: updatedData.validated_at ?? null,
      },
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
