/**
 * POST /api/admin/ingest/bulletin
 *
 * Admin endpoint to ingest a Visa Bulletin page.
 * Accepts { sourceUrl, rawHtml }, validates input, parses the bulletin,
 * and returns the parse result without persisting.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { parseBulletin } from "@/lib/parser";

const IngestRequestSchema = z.object({
  sourceUrl: z.url(),
  rawHtml: z.string().check(z.minLength(1, "rawHtml must not be empty")),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = IngestRequestSchema.parse(body);

    const result = parseBulletin(validated.rawHtml);

    return NextResponse.json({
      success: true,
      sourceUrl: validated.sourceUrl,
      bulletin_month: result.bulletin_month,
      row_count: result.rows.length,
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
      return NextResponse.json(
        {
          success: false,
          error: "Parse failed",
          message: error.message,
        },
        { status: 422 }
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
