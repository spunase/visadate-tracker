/**
 * POST /api/admin/ingest/bulletin
 *
 * Admin endpoint to ingest a Visa Bulletin page.
 *
 * Supports three modes:
 * 1. Manual paste:   { sourceUrl, rawHtml }
 * 2. Auto-fetch:     { fetchLatest: true }
 * 3. Specific month: { year: 2026, month: 3 }
 *
 * After parsing, persists the bulletin to Supabase and returns the result.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBulletin } from "@/lib/parser";
import {
  fetchLatestBulletin,
  fetchBulletinForMonth,
} from "@/lib/parser/fetch-bulletin";
import { saveParsedBulletin } from "@/lib/parser/save-bulletin";

// --- Request schemas (discriminated union) ---

const ManualIngestSchema = z.object({
  sourceUrl: z.string().url(),
  rawHtml: z.string().min(1, "rawHtml must not be empty"),
  fetchLatest: z.undefined().optional(),
  year: z.undefined().optional(),
  month: z.undefined().optional(),
});

const FetchLatestSchema = z.object({
  fetchLatest: z.literal(true),
  sourceUrl: z.undefined().optional(),
  rawHtml: z.undefined().optional(),
  year: z.undefined().optional(),
  month: z.undefined().optional(),
});

const FetchMonthSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  fetchLatest: z.undefined().optional(),
  sourceUrl: z.undefined().optional(),
  rawHtml: z.undefined().optional(),
});

const IngestRequestSchema = z.union([
  ManualIngestSchema,
  FetchLatestSchema,
  FetchMonthSchema,
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = IngestRequestSchema.parse(body);

    let html: string;
    let sourceUrl: string;

    // Determine the mode and get HTML
    if ("rawHtml" in validated && validated.rawHtml) {
      // Mode 1: Manual paste
      html = validated.rawHtml;
      sourceUrl = validated.sourceUrl!;
    } else if ("fetchLatest" in validated && validated.fetchLatest) {
      // Mode 2: Auto-fetch latest
      const fetched = await fetchLatestBulletin();
      if (!fetched) {
        return NextResponse.json(
          {
            success: false,
            error: "Fetch failed",
            message:
              "Could not fetch the latest Visa Bulletin from travel.state.gov. The page may not be published yet.",
          },
          { status: 502 }
        );
      }
      html = fetched.html;
      sourceUrl = fetched.url;
    } else if ("year" in validated && validated.year && validated.month) {
      // Mode 3: Fetch specific month
      const fetched = await fetchBulletinForMonth(
        validated.year,
        validated.month
      );
      if (!fetched) {
        return NextResponse.json(
          {
            success: false,
            error: "Fetch failed",
            message: `Could not fetch Visa Bulletin for ${validated.year}-${String(validated.month).padStart(2, "0")} from travel.state.gov.`,
          },
          { status: 502 }
        );
      }
      html = fetched.html;
      sourceUrl = fetched.url;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          message:
            'Provide either { sourceUrl, rawHtml }, { fetchLatest: true }, or { year, month }.',
        },
        { status: 400 }
      );
    }

    // Parse the bulletin HTML
    const result = parseBulletin(html);

    // Save to Supabase
    const saveResult = await saveParsedBulletin(result, { sourceUrl });

    return NextResponse.json({
      success: true,
      sourceUrl,
      bulletin_month: result.bulletin_month,
      bulletin_id: saveResult.bulletinId,
      is_new: saveResult.isNew,
      row_count: result.rows.length,
      movement_count: saveResult.movementCount,
      rows: result.rows,
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

    if (error instanceof Error) {
      // Distinguish parse errors from DB errors
      const isDbError =
        error.message.includes("Supabase") ||
        error.message.includes("Failed to insert") ||
        error.message.includes("Failed to check");

      return NextResponse.json(
        {
          success: false,
          error: isDbError ? "Database error" : "Parse failed",
          message: error.message,
        },
        { status: isDbError ? 503 : 422 }
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
