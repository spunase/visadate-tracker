/**
 * Save a parsed Visa Bulletin to Cloud Firestore.
 *
 * Inserts into visa_bulletins, visa_cutoff_rows, and derived_monthly_movements.
 * Idempotent: skips if the bulletin_month already exists.
 */

import { getAdminDb } from "@/lib/firebase-admin";
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
 * Commit an array of Firestore set operations in batches of <= 450 docs.
 */
async function batchSetDocs(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  items: Array<{ id: string; data: Record<string, unknown> }>,
): Promise<void> {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const item of chunk) {
      const ref = db.collection(collectionName).doc(item.id);
      batch.set(ref, item.data);
    }
    await batch.commit();
  }
}

/**
 * Save a parsed bulletin to Cloud Firestore.
 *
 * Steps:
 * 1. Check if bulletin_month already exists (idempotent)
 * 2. Insert into visa_bulletins with validation_status='draft'
 * 3. Insert all cutoff rows into visa_cutoff_rows (with denormalized bulletin_month)
 * 4. Calculate and insert derived_monthly_movements by comparing with prior month
 *
 * @param parseResult - Output from parseBulletin()
 * @param options - Source URL for the bulletin
 * @returns The bulletin ID, whether it was newly created, and row/movement counts
 * @throws Error if Firebase Admin Firestore is not configured or DB operations fail
 */
export async function saveParsedBulletin(
  parseResult: BulletinParseResult,
  options: SaveBulletinOptions
): Promise<SaveBulletinResult> {
  const db = getAdminDb();
  if (!db) {
    throw new Error(
      "Firebase Admin Firestore is not configured. Check FIREBASE_SERVICE_ACCOUNT_KEY."
    );
  }

  const { bulletin_month, rows } = parseResult;
  const nowIso = new Date().toISOString();

  // 1. Check for existing bulletin (idempotent)
  const existingSnap = await db
    .collection("visa_bulletins")
    .where("bulletin_month", "==", bulletin_month)
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return {
      bulletinId: existingSnap.docs[0].id,
      isNew: false,
      rowCount: 0,
      movementCount: 0,
    };
  }

  // 2. Insert bulletin record using deterministic bulletin_month document ID
  const bulletinId = bulletin_month;
  const bulletinRef = db.collection("visa_bulletins").doc(bulletinId);
  await bulletinRef.set({
    id: bulletinId,
    bulletin_month,
    source_url: options.sourceUrl,
    source_published_at: nowIso,
    raw_snapshot_path: null,
    validation_status: "draft",
    validated_at: null,
    created_at: nowIso,
  });

  // 3. Insert cutoff rows
  const cutoffItems = rows.map((row) => {
    const id = `${bulletin_month}_${row.chart_type}_${row.category}_${row.country_bucket}`;
    return {
      id,
      data: {
        id,
        bulletin_id: bulletinId,
        bulletin_month,
        chart_type: row.chart_type,
        category: row.category,
        country_bucket: row.country_bucket,
        cutoff_kind: row.cutoff_kind,
        cutoff_date: row.cutoff_date,
        original_value: row.original_value,
        created_at: nowIso,
      },
    };
  });

  if (cutoffItems.length > 0) {
    await batchSetDocs(db, "visa_cutoff_rows", cutoffItems);
  }

  // 4. Calculate and insert derived monthly movements
  let movementCount = 0;
  const priorMonth = getPriorMonth(bulletin_month);

  const priorRowsSnap = await db
    .collection("visa_cutoff_rows")
    .where("bulletin_month", "==", priorMonth)
    .get();

  if (!priorRowsSnap.empty) {
    const priorMap = new Map<string, ParsedCutoffRow>();
    for (const doc of priorRowsSnap.docs) {
      const pr = doc.data();
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

    const movementItems: Array<{ id: string; data: Record<string, unknown> }> = [];

    for (const currentRow of rows) {
      const key = `${currentRow.chart_type}|${currentRow.category}|${currentRow.country_bucket}`;
      const priorRow = priorMap.get(key);
      if (!priorRow) continue;

      const movement = calculateMovement(currentRow, priorRow);
      const id = `${bulletin_month}_${currentRow.chart_type}_${currentRow.category}_${currentRow.country_bucket}`;

      movementItems.push({
        id,
        data: {
          id,
          category: currentRow.category,
          country_bucket: currentRow.country_bucket,
          chart_type: currentRow.chart_type,
          bulletin_month,
          prior_bulletin_month: priorMonth,
          movement_days: movement.movement_days ?? 0,
          movement_direction: movement.movement_direction,
          is_retrogression: movement.is_retrogression,
          is_no_change: movement.is_no_change,
          created_at: nowIso,
        },
      });
    }

    if (movementItems.length > 0) {
      await batchSetDocs(db, "derived_monthly_movements", movementItems);
      movementCount = movementItems.length;
    }
  }

  return {
    bulletinId,
    isNew: true,
    rowCount: cutoffItems.length,
    movementCount,
  };
}
