// ============================================================================
// VisaDateTracker — Cloud Firestore Seed & Migration Script
// Usage:
//   node scripts/seed.mjs
//   node scripts/seed.mjs --from-backup path/to/backup.json
// ============================================================================

import fs from "node:fs";
import path from "node:path";
import { initializeApp, cert, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function log(msg) {
  console.log(`[seed] ${msg}`);
}

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
    return;
  }
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

function initFirestore() {
  loadLocalEnv();

  if (getApps().length === 0) {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (rawKey) {
      const sa = JSON.parse(rawKey);
      if (sa.private_key && typeof sa.private_key === "string") {
        sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      }
      initializeApp({
        credential: cert(sa),
        projectId: sa.project_id ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      throw new Error(
        "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local or GOOGLE_APPLICATION_CREDENTIALS.",
      );
    }
  }

  return getFirestore();
}

async function batchWrite(db, collectionName, items) {
  const CHUNK_SIZE = 450;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const item of chunk) {
      batch.set(db.collection(collectionName).doc(item.id), item.data);
    }
    await batch.commit();
  }
}

// ---------------------------------------------------------------------------
// Backup importer (--from-backup)
// ---------------------------------------------------------------------------

async function seedFromBackup(db, backupPath) {
  log(`Importing backup from ${backupPath}...`);
  const raw = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  const tables = raw.tables ?? {};

  const bulletins = tables.visa_bulletins ?? [];
  const cutoffRows = tables.visa_cutoff_rows ?? [];
  const chartSelections = tables.uscis_chart_selection ?? [];
  const policyUpdates = tables.policy_updates ?? [];
  const milestoneRules = tables.milestone_rules ?? [];
  const movements = tables.derived_monthly_movements ?? [];

  const bulletinIdToMonth = new Map();
  for (const b of bulletins) {
    bulletinIdToMonth.set(b.id, b.bulletin_month);
  }

  // 1. visa_bulletins (keyed by bulletin_month)
  const bulletinItems = bulletins.map((b) => ({
    id: b.bulletin_month,
    data: {
      id: b.bulletin_month,
      bulletin_month: b.bulletin_month,
      source_url: b.source_url,
      source_published_at: b.source_published_at,
      raw_snapshot_path: b.raw_snapshot_path ?? null,
      validation_status: b.validation_status,
      validated_at: b.validated_at ?? null,
      created_at: b.created_at,
    },
  }));
  await batchWrite(db, "visa_bulletins", bulletinItems);
  log(`  Imported ${bulletinItems.length} visa_bulletins`);

  // 2. visa_cutoff_rows (enrich with denormalized bulletin_month & matching bulletin_id)
  const cutoffItems = cutoffRows.map((r) => {
    const month = bulletinIdToMonth.get(r.bulletin_id) ?? r.bulletin_month;
    if (!month) {
      throw new Error(`Cutoff row ${r.id} references unknown bulletin_id ${r.bulletin_id}`);
    }
    const id = `${month}_${r.chart_type}_${r.category}_${r.country_bucket}`;
    return {
      id,
      data: {
        id,
        bulletin_id: month,
        bulletin_month: month,
        chart_type: r.chart_type,
        category: r.category,
        country_bucket: r.country_bucket,
        cutoff_kind: r.cutoff_kind,
        cutoff_date: r.cutoff_date ?? null,
        original_value: r.original_value,
        created_at: r.created_at,
      },
    };
  });
  await batchWrite(db, "visa_cutoff_rows", cutoffItems);
  log(`  Imported ${cutoffItems.length} visa_cutoff_rows`);

  // 3. uscis_chart_selection
  const chartItems = chartSelections.map((c) => {
    const id = `${c.bulletin_month}_${c.preference_scope}`;
    return {
      id,
      data: {
        id,
        bulletin_month: c.bulletin_month,
        preference_scope: c.preference_scope,
        chart_to_use: c.chart_to_use,
        source_url: c.source_url,
        source_published_at: c.source_published_at,
        created_at: c.created_at,
      },
    };
  });
  await batchWrite(db, "uscis_chart_selection", chartItems);
  log(`  Imported ${chartItems.length} uscis_chart_selection`);

  // 4. policy_updates
  const policyItems = policyUpdates.map((p) => ({
    id: p.id,
    data: {
      id: p.id,
      topic: p.topic,
      subtopic: p.subtopic ?? null,
      title: p.title,
      source_url: p.source_url,
      publisher: p.publisher,
      published_at: p.published_at,
      summary: p.summary,
      why_it_matters: p.why_it_matters,
      freshness_expires_at: p.freshness_expires_at,
      source_type: p.source_type,
      is_active: Boolean(p.is_active),
      created_at: p.created_at,
    },
  }));
  await batchWrite(db, "policy_updates", policyItems);
  log(`  Imported ${policyItems.length} policy_updates`);

  // 5. milestone_rules (if any)
  if (milestoneRules.length > 0) {
    const ruleItems = milestoneRules.map((m) => ({
      id: m.slug ?? m.id,
      data: { ...m, id: m.slug ?? m.id },
    }));
    await batchWrite(db, "milestone_rules", ruleItems);
    log(`  Imported ${ruleItems.length} milestone_rules`);
  }

  // 6. derived_monthly_movements
  const movementItems = movements.map((m) => {
    const id = `${m.bulletin_month}_${m.chart_type}_${m.category}_${m.country_bucket}`;
    return {
      id,
      data: {
        id,
        category: m.category,
        country_bucket: m.country_bucket,
        chart_type: m.chart_type,
        bulletin_month: m.bulletin_month,
        prior_bulletin_month: m.prior_bulletin_month,
        movement_days: m.movement_days,
        movement_direction: m.movement_direction,
        is_retrogression: Boolean(m.is_retrogression),
        is_no_change: Boolean(m.is_no_change),
        created_at: m.created_at,
      },
    };
  });
  await batchWrite(db, "derived_monthly_movements", movementItems);
  log(`  Imported ${movementItems.length} derived_monthly_movements`);

  log("Backup import complete!");
}

// ---------------------------------------------------------------------------
// Deterministic Seed Data (standalone fallback)
// ---------------------------------------------------------------------------

function addMonths(dateStr, months) {
  const [y, m] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function diffDays(a, b) {
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.round((db - da) / 86400000);
}

function formatOriginalValue(cutoffKind, cutoffDate) {
  if (cutoffKind === "current") return "C";
  if (cutoffKind === "unavailable") return "U";
  const d = new Date(cutoffDate + "T00:00:00Z");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = months[d.getUTCMonth()];
  const yr = String(d.getUTCFullYear()).slice(2);
  return `${day}${mon}${yr}`;
}

const MONTHS = [];
for (let i = 0; i < 12; i++) {
  MONTHS.push(addMonths("2025-04", i));
}

const EB2_INDIA_FA = [
  "2012-09-01", "2012-10-15", "2012-11-15", "2012-12-01", "2013-01-01",
  "2013-02-01", "2013-03-01", "2013-01-01", "2013-02-01", "2013-04-01",
  "2013-07-15", "2013-09-15",
];

const EB3_INDIA_FA = [
  "2012-11-01", "2012-12-01", "2013-01-01", "2013-02-01", "2013-03-01",
  "2013-04-01", "2013-05-01", "2013-06-01", "2013-07-15", "2013-09-01",
  "2013-11-15", "2013-11-15",
];

const EB1_INDIA_FA = [
  "2022-01-01", "2022-03-01", "2022-05-01", "2022-07-01", "2022-08-15",
  "2022-09-15", "2022-10-01", "2022-10-15", "2022-11-15", "2023-01-01",
  "2023-02-01", "2023-03-01",
];

const EB2_CHINA_FA = [
  "2020-09-01", "2020-10-01", "2020-11-01", "2020-12-01", "2021-01-01",
  "2021-02-01", "2021-03-01", "2021-01-01", "2021-02-01", "2021-04-01",
  "2021-06-01", "2021-09-01",
];

const EB3_CHINA_FA = [
  "2020-05-01", "2020-06-01", "2020-07-01", "2020-08-01", "2020-09-01",
  "2020-10-01", "2020-11-01", "2020-12-01", "2021-01-01", "2021-02-01",
  "2021-03-15", "2021-05-01",
];

const EB1_CHINA_FA = [
  "2022-03-01", "2022-05-01", "2022-07-01", "2022-08-01", "2022-09-01",
  "2022-10-01", "2022-11-01", "2022-12-01", "2023-01-01", "2023-02-01",
  "2023-03-01", "2023-03-01",
];

function advanceByMonths(dates, monthsAhead) {
  return dates.map((d) => {
    const dt = new Date(d + "T00:00:00Z");
    dt.setUTCMonth(dt.getUTCMonth() + monthsAhead);
    return formatDate(dt);
  });
}

const progressions = {
  "EB1|india|final_action": EB1_INDIA_FA,
  "EB2|india|final_action": EB2_INDIA_FA,
  "EB3|india|final_action": EB3_INDIA_FA,
  "EB1|china_mainland|final_action": EB1_CHINA_FA,
  "EB2|china_mainland|final_action": EB2_CHINA_FA,
  "EB3|china_mainland|final_action": EB3_CHINA_FA,
  "EB1|india|dates_for_filing": advanceByMonths(EB1_INDIA_FA, 9),
  "EB2|india|dates_for_filing": advanceByMonths(EB2_INDIA_FA, 14),
  "EB3|india|dates_for_filing": advanceByMonths(EB3_INDIA_FA, 9),
  "EB1|china_mainland|dates_for_filing": advanceByMonths(EB1_CHINA_FA, 9),
  "EB2|china_mainland|dates_for_filing": advanceByMonths(EB2_CHINA_FA, 4),
  "EB3|china_mainland|dates_for_filing": advanceByMonths(EB3_CHINA_FA, 8),
};

async function seedDefaultData(db) {
  log("Starting standalone Firestore seed...");
  const nowIso = new Date().toISOString();
  const monthNames = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // 1. visa_bulletins
  const bulletinItems = MONTHS.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const name = monthNames[mo];
    const pubMonth = mo === 1 ? 12 : mo - 1;
    const pubYear = mo === 1 ? y - 1 : y;
    return {
      id: m,
      data: {
        id: m,
        bulletin_month: m,
        source_url: `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${y}/visa-bulletin-for-${name.toLowerCase()}-${y}.html`,
        source_published_at: `${pubYear}-${String(pubMonth).padStart(2, "0")}-15T12:00:00Z`,
        raw_snapshot_path: null,
        validation_status: "published",
        validated_at: null,
        created_at: nowIso,
      },
    };
  });
  await batchWrite(db, "visa_bulletins", bulletinItems);
  log(`  Seeded ${bulletinItems.length} visa_bulletins`);

  // 2. visa_cutoff_rows
  const categories = ["EB1", "EB2", "EB3"];
  const countries = ["india", "china_mainland", "all_other"];
  const chartTypes = ["final_action", "dates_for_filing"];
  const cutoffItems = [];

  for (let mi = 0; mi < MONTHS.length; mi++) {
    const month = MONTHS[mi];
    for (const cat of categories) {
      for (const country of countries) {
        for (const chartType of chartTypes) {
          const id = `${month}_${chartType}_${cat}_${country}`;
          if (country === "all_other") {
            cutoffItems.push({
              id,
              data: {
                id,
                bulletin_id: month,
                bulletin_month: month,
                chart_type: chartType,
                category: cat,
                country_bucket: country,
                cutoff_kind: "current",
                cutoff_date: null,
                original_value: "C",
                created_at: nowIso,
              },
            });
          } else {
            const cutoffDate = progressions[`${cat}|${country}|${chartType}`][mi];
            cutoffItems.push({
              id,
              data: {
                id,
                bulletin_id: month,
                bulletin_month: month,
                chart_type: chartType,
                category: cat,
                country_bucket: country,
                cutoff_kind: "date",
                cutoff_date: cutoffDate,
                original_value: formatOriginalValue("date", cutoffDate),
                created_at: nowIso,
              },
            });
          }
        }
      }
    }
  }
  await batchWrite(db, "visa_cutoff_rows", cutoffItems);
  log(`  Seeded ${cutoffItems.length} visa_cutoff_rows`);

  // 3. uscis_chart_selection
  const dffMonths = new Set(["2025-06", "2025-10", "2026-02"]);
  const chartItems = MONTHS.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const pubMonth = mo === 1 ? 12 : mo - 1;
    const pubYear = mo === 1 ? y - 1 : y;
    const id = `${m}_employment_based`;
    return {
      id,
      data: {
        id,
        bulletin_month: m,
        preference_scope: "employment_based",
        chart_to_use: dffMonths.has(m) ? "dates_for_filing" : "final_action",
        source_url: `https://www.uscis.gov/visabulletininfo/${m}`,
        source_published_at: `${pubYear}-${String(pubMonth).padStart(2, "0")}-18T12:00:00Z`,
        created_at: nowIso,
      },
    };
  });
  await batchWrite(db, "uscis_chart_selection", chartItems);
  log(`  Seeded ${chartItems.length} uscis_chart_selection`);

  // 4. policy_updates
  const policyUpdates = [
    {
      id: "pu-eb2-niw-stem",
      topic: "Employment-Based Immigration",
      subtopic: "EB-2 NIW",
      title: "USCIS Updates EB-2 NIW Filing Guidance for STEM Applicants",
      source_url: "https://www.uscis.gov/newsroom/alerts/uscis-updates-eb2-niw-stem-guidance",
      publisher: "USCIS",
      published_at: "2025-08-12T16:00:00Z",
      summary: "USCIS issued updated policy guidance clarifying the evidentiary standards for EB-2 National Interest Waiver petitions filed by STEM professionals, emphasizing critical technology areas.",
      why_it_matters: "Applicants in AI, semiconductors, and clean energy fields may benefit from a more streamlined adjudication process under the new guidance.",
      freshness_expires_at: "2025-11-12T16:00:00Z",
      source_type: "official",
      is_active: true,
      created_at: nowIso,
    },
    {
      id: "pu-nov-2025-retrogression",
      topic: "Visa Bulletin",
      subtopic: "Retrogression",
      title: "November 2025 Visa Bulletin Shows EB-2 India Retrogression",
      source_url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-november-2025.html",
      publisher: "Department of State",
      published_at: "2025-10-15T12:00:00Z",
      summary: "The November 2025 Visa Bulletin moved the EB-2 India Final Action date backward by approximately two months, from June 2012 to April 2012, marking the first retrogression of the fiscal year.",
      why_it_matters: "EB-2 India applicants with priority dates between April and June 2012 who were previously current will no longer be able to file or have their cases adjudicated until dates advance again.",
      freshness_expires_at: "2026-01-15T12:00:00Z",
      source_type: "official",
      is_active: true,
      created_at: nowIso,
    },
    {
      id: "pu-i485-nebraska-times",
      topic: "Processing Times",
      subtopic: "I-485",
      title: "USCIS Reports Reduced I-485 Processing Times at Nebraska Service Center",
      source_url: "https://www.uscis.gov/newsroom/alerts/processing-times-update-nebraska",
      publisher: "USCIS",
      published_at: "2026-01-20T14:00:00Z",
      summary: "USCIS announced that I-485 processing times at the Nebraska Service Center have decreased by an average of 3 months for employment-based categories due to increased staffing and process improvements.",
      why_it_matters: "EB applicants whose cases are pending at the Nebraska Service Center may see faster adjudication, potentially reducing overall green card wait times.",
      freshness_expires_at: "2026-04-20T14:00:00Z",
      source_type: "official",
      is_active: true,
      created_at: nowIso,
    },
    {
      id: "pu-country-cap-bill",
      topic: "Legislation",
      subtopic: "Country Cap Reform",
      title: "Bipartisan Bill to Eliminate Per-Country Green Card Caps Reintroduced in Senate",
      source_url: "https://www.congress.gov/bill/119th-congress/senate-bill/example",
      publisher: "U.S. Congress",
      published_at: "2026-02-28T18:00:00Z",
      summary: "A bipartisan group of senators reintroduced legislation to eliminate the 7% per-country cap on employment-based green cards, which would primarily benefit applicants from India and China facing multi-year backlogs.",
      why_it_matters: "If enacted, the bill could dramatically reduce wait times for EB-2 and EB-3 India applicants from decades to a few years, though passage remains uncertain.",
      freshness_expires_at: "2026-08-28T18:00:00Z",
      source_type: "secondary",
      is_active: true,
      created_at: nowIso,
    },
  ];
  await batchWrite(
    db,
    "policy_updates",
    policyUpdates.map((p) => ({ id: p.id, data: p })),
  );
  log(`  Seeded ${policyUpdates.length} policy_updates`);

  // 5. derived_monthly_movements
  const combos = [
    { category: "EB2", country_bucket: "india", chart_type: "final_action", dates: EB2_INDIA_FA },
    { category: "EB3", country_bucket: "india", chart_type: "final_action", dates: EB3_INDIA_FA },
  ];
  const movementItems = [];
  for (const combo of combos) {
    for (let i = 1; i < MONTHS.length; i++) {
      const days = diffDays(combo.dates[i - 1], combo.dates[i]);
      const direction = days > 0 ? "forward" : days < 0 ? "backward" : "unchanged";
      const id = `${MONTHS[i]}_${combo.chart_type}_${combo.category}_${combo.country_bucket}`;
      movementItems.push({
        id,
        data: {
          id,
          category: combo.category,
          country_bucket: combo.country_bucket,
          chart_type: combo.chart_type,
          bulletin_month: MONTHS[i],
          prior_bulletin_month: MONTHS[i - 1],
          movement_days: days,
          movement_direction: direction,
          is_retrogression: days < 0,
          is_no_change: days === 0,
          created_at: nowIso,
        },
      });
    }
  }
  await batchWrite(db, "derived_monthly_movements", movementItems);
  log(`  Seeded ${movementItems.length} derived_monthly_movements`);

  log("Seed complete!");
}

async function main() {
  const db = initFirestore();
  const backupIdx = process.argv.indexOf("--from-backup");
  if (backupIdx !== -1) {
    const backupPath = process.argv[backupIdx + 1];
    if (!backupPath) {
      throw new Error("Usage: node scripts/seed.mjs --from-backup <path>");
    }
    await seedFromBackup(db, path.resolve(backupPath));
  } else {
    await seedDefaultData(db);
  }
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
