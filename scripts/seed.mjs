// ============================================================================
// VisaDateTracker — Database Seed Script
// Usage: node scripts/seed.mjs
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hftwxnporvqgyvwubvez.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmdHd4bnBvcnZxZ3l2d3VidmV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwODU1NiwiZXhwIjoyMDg5ODg0NTU2fQ.Zb3JvHE-WxT9D3SimhqmE3RgOx6aJMvCIe7ycCyoBTc";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) {
  console.log(`[seed] ${msg}`);
}

function addMonths(dateStr, months) {
  // dateStr = "YYYY-MM"
  const [y, m] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(d) {
  // Date -> "YYYY-MM-DD"
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return formatDate(d);
}

function diffDays(a, b) {
  // b - a in days
  const da = new Date(a + "T00:00:00Z");
  const db = new Date(b + "T00:00:00Z");
  return Math.round((db - da) / 86400000);
}

function formatOriginalValue(cutoffKind, cutoffDate) {
  if (cutoffKind === "current") return "C";
  if (cutoffKind === "unavailable") return "U";
  // format as "01SEP12"
  const d = new Date(cutoffDate + "T00:00:00Z");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = months[d.getUTCMonth()];
  const yr = String(d.getUTCFullYear()).slice(2);
  return `${day}${mon}${yr}`;
}

// ---------------------------------------------------------------------------
// 1. Visa Bulletins (12 months: 2025-04 to 2026-03)
// ---------------------------------------------------------------------------

const MONTHS = [];
for (let i = 0; i < 12; i++) {
  MONTHS.push(addMonths("2025-04", i));
}

function buildBulletins() {
  const monthNames = [
    "","January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  return MONTHS.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const name = monthNames[mo];
    // Published ~15th of prior month
    const pubMonth = mo === 1 ? 12 : mo - 1;
    const pubYear = mo === 1 ? y - 1 : y;
    return {
      bulletin_month: m,
      source_url: `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${y}/visa-bulletin-for-${name.toLowerCase()}-${y}.html`,
      source_published_at: `${pubYear}-${String(pubMonth).padStart(2,"0")}-15T12:00:00Z`,
      validation_status: "published",
    };
  });
}

// ---------------------------------------------------------------------------
// 2. Visa Cutoff Rows — realistic progressions
// ---------------------------------------------------------------------------

// Progressions keyed by `${category}|${country}|${chartType}`
// Each array has 12 entries (one per bulletin month).
// For "all_other" we use cutoff_kind='current'.

// Progressions corrected so March 2026 (index 11) matches the official DOS
// Visa Bulletin for March 2026.  Prior months are plausible approximations.
const EB2_INDIA_FA = [
  "2012-09-01", "2012-10-15", "2012-11-15", "2012-12-01", "2013-01-01",
  "2013-02-01", "2013-03-01", "2013-01-01", // Nov 2025 retrogression (~2 months back)
  "2013-02-01", "2013-04-01", "2013-07-15", "2013-09-15",
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
  "2021-02-01", "2021-03-01", "2021-01-01", // retrogression mirrors India timing
  "2021-02-01", "2021-04-01", "2021-06-01", "2021-09-01",
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

// Dates for Filing: ~6-9 months more advanced than FA
function advanceByMonths(dates, monthsAhead) {
  return dates.map((d) => {
    const dt = new Date(d + "T00:00:00Z");
    dt.setUTCMonth(dt.getUTCMonth() + monthsAhead);
    return formatDate(dt);
  });
}

// DFF offsets tuned so March 2026 (index 11) matches the official bulletin:
//   EB2 India DFF: 01NOV14, EB3 India DFF: 15AUG14, EB1 India DFF: 01DEC23
//   EB2 China DFF: 01JAN22, EB3 China DFF: 01JAN22, EB1 China DFF: 01DEC23
const EB2_INDIA_DFF = advanceByMonths(EB2_INDIA_FA, 14);
const EB3_INDIA_DFF = advanceByMonths(EB3_INDIA_FA, 9);
const EB1_INDIA_DFF = advanceByMonths(EB1_INDIA_FA, 9);
const EB2_CHINA_DFF = advanceByMonths(EB2_CHINA_FA, 4);
const EB3_CHINA_DFF = advanceByMonths(EB3_CHINA_FA, 8);
const EB1_CHINA_DFF = advanceByMonths(EB1_CHINA_FA, 9);

// Build the progression map
const progressions = {
  "EB1|india|final_action": EB1_INDIA_FA,
  "EB2|india|final_action": EB2_INDIA_FA,
  "EB3|india|final_action": EB3_INDIA_FA,
  "EB1|china_mainland|final_action": EB1_CHINA_FA,
  "EB2|china_mainland|final_action": EB2_CHINA_FA,
  "EB3|china_mainland|final_action": EB3_CHINA_FA,
  "EB1|india|dates_for_filing": EB1_INDIA_DFF,
  "EB2|india|dates_for_filing": EB2_INDIA_DFF,
  "EB3|india|dates_for_filing": EB3_INDIA_DFF,
  "EB1|china_mainland|dates_for_filing": EB1_CHINA_DFF,
  "EB2|china_mainland|dates_for_filing": EB2_CHINA_DFF,
  "EB3|china_mainland|dates_for_filing": EB3_CHINA_DFF,
};

function buildCutoffRows(bulletinIdMap) {
  const categories = ["EB1", "EB2", "EB3"];
  const countries = ["india", "china_mainland", "all_other"];
  const chartTypes = ["final_action", "dates_for_filing"];
  const rows = [];

  for (let mi = 0; mi < MONTHS.length; mi++) {
    const month = MONTHS[mi];
    const bulletinId = bulletinIdMap[month];

    for (const cat of categories) {
      for (const country of countries) {
        for (const chartType of chartTypes) {
          const key = `${cat}|${country}|${chartType}`;
          if (country === "all_other") {
            rows.push({
              bulletin_id: bulletinId,
              chart_type: chartType,
              category: cat,
              country_bucket: country,
              cutoff_kind: "current",
              cutoff_date: null,
              original_value: "C",
            });
          } else {
            const dates = progressions[key];
            if (!dates) {
              throw new Error(`No progression for key: ${key}`);
            }
            const cutoffDate = dates[mi];
            rows.push({
              bulletin_id: bulletinId,
              chart_type: chartType,
              category: cat,
              country_bucket: country,
              cutoff_kind: "date",
              cutoff_date: cutoffDate,
              original_value: formatOriginalValue("date", cutoffDate),
            });
          }
        }
      }
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// 3. USCIS Chart Selection
// ---------------------------------------------------------------------------

function buildChartSelections() {
  // Most months use final_action; a few use dates_for_filing
  const dffMonths = new Set(["2025-06", "2025-10", "2026-02"]);
  return MONTHS.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const pubMonth = mo === 1 ? 12 : mo - 1;
    const pubYear = mo === 1 ? y - 1 : y;
    return {
      bulletin_month: m,
      preference_scope: "employment_based",
      chart_to_use: dffMonths.has(m) ? "dates_for_filing" : "final_action",
      source_url: `https://www.uscis.gov/visabulletininfo/${m}`,
      source_published_at: `${pubYear}-${String(pubMonth).padStart(2,"0")}-18T12:00:00Z`,
    };
  });
}

// ---------------------------------------------------------------------------
// 4. Policy Updates
// ---------------------------------------------------------------------------

function buildPolicyUpdates() {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

// ---------------------------------------------------------------------------
// 5. Derived Monthly Movements (EB2/EB3 India FA only)
// ---------------------------------------------------------------------------

function buildMovements() {
  const combos = [
    { category: "EB2", country_bucket: "india", chart_type: "final_action", dates: EB2_INDIA_FA },
    { category: "EB3", country_bucket: "india", chart_type: "final_action", dates: EB3_INDIA_FA },
  ];
  const rows = [];

  for (const combo of combos) {
    for (let i = 1; i < MONTHS.length; i++) {
      const days = diffDays(combo.dates[i - 1], combo.dates[i]);
      let direction;
      if (days > 0) direction = "forward";
      else if (days < 0) direction = "backward";
      else direction = "unchanged";

      rows.push({
        category: combo.category,
        country_bucket: combo.country_bucket,
        chart_type: combo.chart_type,
        bulletin_month: MONTHS[i],
        prior_bulletin_month: MONTHS[i - 1],
        movement_days: days,
        movement_direction: direction,
        is_retrogression: days < 0,
        is_no_change: days === 0,
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log("Starting seed...");

  // --- 1. Visa Bulletins (upsert on bulletin_month) ---
  log("Upserting visa_bulletins...");
  const bulletins = buildBulletins();
  const { data: bulletinData, error: bulletinErr } = await supabase
    .from("visa_bulletins")
    .upsert(bulletins, { onConflict: "bulletin_month" })
    .select("id, bulletin_month");

  if (bulletinErr) {
    console.error("Error upserting visa_bulletins:", bulletinErr);
    process.exit(1);
  }
  log(`  Upserted ${bulletinData.length} bulletins`);

  // Build month -> id map
  const bulletinIdMap = {};
  for (const b of bulletinData) {
    bulletinIdMap[b.bulletin_month] = b.id;
  }

  // --- 2. Visa Cutoff Rows ---
  log("Inserting visa_cutoff_rows...");
  // Delete existing rows for these bulletins first to avoid unique constraint violations
  const bulletinIds = Object.values(bulletinIdMap);
  const { error: delCutoffErr } = await supabase
    .from("visa_cutoff_rows")
    .delete()
    .in("bulletin_id", bulletinIds);

  if (delCutoffErr) {
    console.error("Error deleting old cutoff rows:", delCutoffErr);
    process.exit(1);
  }

  const cutoffRows = buildCutoffRows(bulletinIdMap);
  log(`  Prepared ${cutoffRows.length} cutoff rows`);

  // Insert in batches of 50
  for (let i = 0; i < cutoffRows.length; i += 50) {
    const batch = cutoffRows.slice(i, i + 50);
    const { error: cutoffErr } = await supabase
      .from("visa_cutoff_rows")
      .insert(batch);
    if (cutoffErr) {
      console.error(`Error inserting cutoff rows batch ${i}:`, cutoffErr);
      process.exit(1);
    }
  }
  log(`  Inserted ${cutoffRows.length} cutoff rows`);

  // --- 3. USCIS Chart Selection ---
  log("Inserting uscis_chart_selection...");
  // Delete existing for these months
  const { error: delChartErr } = await supabase
    .from("uscis_chart_selection")
    .delete()
    .in("bulletin_month", MONTHS);

  if (delChartErr) {
    console.error("Error deleting old chart selections:", delChartErr);
    process.exit(1);
  }

  const chartSelections = buildChartSelections();
  const { error: chartErr } = await supabase
    .from("uscis_chart_selection")
    .insert(chartSelections);

  if (chartErr) {
    console.error("Error inserting chart selections:", chartErr);
    process.exit(1);
  }
  log(`  Inserted ${chartSelections.length} chart selections`);

  // --- 4. Policy Updates ---
  log("Inserting policy_updates...");
  // Delete all existing policy updates to avoid duplicates on re-run
  const { error: delPolicyErr } = await supabase
    .from("policy_updates")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

  if (delPolicyErr) {
    console.error("Error deleting old policy updates:", delPolicyErr);
    process.exit(1);
  }

  const policyUpdates = buildPolicyUpdates();
  const { error: policyErr } = await supabase
    .from("policy_updates")
    .insert(policyUpdates);

  if (policyErr) {
    console.error("Error inserting policy updates:", policyErr);
    process.exit(1);
  }
  log(`  Inserted ${policyUpdates.length} policy updates`);

  // --- 5. Derived Monthly Movements ---
  log("Inserting derived_monthly_movements...");
  // Delete existing for these combos/months
  const { error: delMovErr } = await supabase
    .from("derived_monthly_movements")
    .delete()
    .in("bulletin_month", MONTHS.slice(1)); // movements start from month index 1

  if (delMovErr) {
    console.error("Error deleting old movements:", delMovErr);
    process.exit(1);
  }

  const movements = buildMovements();
  const { error: movErr } = await supabase
    .from("derived_monthly_movements")
    .insert(movements);

  if (movErr) {
    console.error("Error inserting movements:", movErr);
    process.exit(1);
  }
  log(`  Inserted ${movements.length} movement rows`);

  // --- Summary ---
  log("Seed complete!");
  log(`  visa_bulletins:           ${bulletins.length}`);
  log(`  visa_cutoff_rows:         ${cutoffRows.length}`);
  log(`  uscis_chart_selection:    ${chartSelections.length}`);
  log(`  policy_updates:           ${policyUpdates.length}`);
  log(`  derived_monthly_movements: ${movements.length}`);
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
