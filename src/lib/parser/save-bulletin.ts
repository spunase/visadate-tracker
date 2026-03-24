/**
 * Save a parsed Visa Bulletin to Supabase.
 *
 * Inserts into visa_bulletins, visa_cutoff_rows, and derived_monthly_movements.
 * Idempotent: skips if the bulletin_month already exists.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateMovement } from "./movement-calculator";
import type { BulletinParseResult, ParsedCutoffRow } from "./types";

export interface SaveBulletinOptions {
  sourceUrl: string;
}

export interface SaveBulletinResult {
  bulletinId: string;
  isNew: boolean;
  rowCount: number;
  movementCount: number;
}

/**
 * Compute the prior month string (YYYY-MM) given a bulletin month.
 */
function getPriorMonth(bulletinMonth: string): string {
  const [yearStr, monthStr] = bulletinMonth.split("-");
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month -= 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * Save a parsed bulletin to Supabase.
 *
 * Steps:
 * 1. Check if bulletin_month already exists (idempotent)
 * 2. Insert into visa_bulletins with validation_status='draft'
 * 3. Insert all cutoff rows into visa_cutoff_rows
 * 4. Calculate and insert derived_monthly_movements by comparing with prior month
 *
 * @param parseResult - Output from parseBulletin()
 * @param options - Source URL for the bulletin
 * @returns The bulletin ID, whether it was newly created, and row/movement counts
 * @throws Error if supabaseAdmin is not configured or DB operations fail
 */
export async function saveParsedBulletin(
  parseResult: BulletinParseResult,
  options: SaveBulletinOptions
): Promise<SaveBulletinResult> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase admin client is not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { bulletin_month, rows } = parseResult;

  // 1. Check for existing bulletin (idempotent)
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("visa_bulletins")
    .select("id")
    .eq("bulletin_month", bulletin_month)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to check existing bulletin: ${lookupError.message}`);
  }

  if (existing) {
    return {
      bulletinId: existing.id,
      isNew: false,
      rowCount: 0,
      movementCount: 0,
    };
  }

  // 2. Insert bulletin record
  const { data: bulletin, error: bulletinError } = await supabaseAdmin
    .from("visa_bulletins")
    .insert({
      bulletin_month,
      source_url: options.sourceUrl,
      source_published_at: new Date().toISOString(),
      validation_status: "draft",
    })
    .select("id")
    .single();

  if (bulletinError || !bulletin) {
    throw new Error(
      `Failed to insert bulletin: ${bulletinError?.message ?? "No data returned"}`
    );
  }

  const bulletinId = bulletin.id;

  // 3. Insert cutoff rows
  const cutoffInserts = rows.map((row) => ({
    bulletin_id: bulletinId,
    chart_type: row.chart_type,
    category: row.category,
    country_bucket: row.country_bucket,
    cutoff_kind: row.cutoff_kind,
    cutoff_date: row.cutoff_date,
    original_value: row.original_value,
  }));

  if (cutoffInserts.length > 0) {
    const { error: rowsError } = await supabaseAdmin
      .from("visa_cutoff_rows")
      .insert(cutoffInserts);

    if (rowsError) {
      throw new Error(`Failed to insert cutoff rows: ${rowsError.message}`);
    }
  }

  // 4. Calculate and insert derived monthly movements
  let movementCount = 0;
  const priorMonth = getPriorMonth(bulletin_month);

  // Look up prior month's bulletin
  const { data: priorBulletin } = await supabaseAdmin
    .from("visa_bulletins")
    .select("id")
    .eq("bulletin_month", priorMonth)
    .maybeSingle();

  if (priorBulletin) {
    // Fetch prior month's cutoff rows
    const { data: priorRows, error: priorRowsError } = await supabaseAdmin
      .from("visa_cutoff_rows")
      .select("*")
      .eq("bulletin_id", priorBulletin.id);

    if (priorRowsError) {
      console.error(
        `Failed to fetch prior month rows: ${priorRowsError.message}`
      );
    } else if (priorRows && priorRows.length > 0) {
      // Build a lookup map for prior rows: chart_type|category|country_bucket → row
      const priorMap = new Map<string, ParsedCutoffRow>();
      for (const pr of priorRows) {
        const key = `${pr.chart_type}|${pr.category}|${pr.country_bucket}`;
        priorMap.set(key, {
          bulletin_month: priorMonth,
          chart_type: pr.chart_type,
          category: pr.category,
          country_bucket: pr.country_bucket,
          cutoff_kind: pr.cutoff_kind,
          cutoff_date: pr.cutoff_date,
          original_value: pr.original_value,
        });
      }

      // Calculate movements for each current row that has a matching prior row
      const movementInserts: Array<Record<string, unknown>> = [];

      for (const currentRow of rows) {
        const key = `${currentRow.chart_type}|${currentRow.category}|${currentRow.country_bucket}`;
        const priorRow = priorMap.get(key);
        if (!priorRow) continue;

        const movement = calculateMovement(currentRow, priorRow);

        movementInserts.push({
          category: currentRow.category,
          country_bucket: currentRow.country_bucket,
          chart_type: currentRow.chart_type,
          bulletin_month: bulletin_month,
          prior_bulletin_month: priorMonth,
          movement_days: movement.movement_days ?? 0,
          movement_direction: movement.movement_direction,
          is_retrogression: movement.is_retrogression,
          is_no_change: movement.is_no_change,
        });
      }

      if (movementInserts.length > 0) {
        const { error: movementError } = await supabaseAdmin
          .from("derived_monthly_movements")
          .insert(movementInserts);

        if (movementError) {
          console.error(
            `Failed to insert movements: ${movementError.message}`
          );
        } else {
          movementCount = movementInserts.length;
        }
      }
    }
  }

  return {
    bulletinId,
    isNew: true,
    rowCount: cutoffInserts.length,
    movementCount,
  };
}
