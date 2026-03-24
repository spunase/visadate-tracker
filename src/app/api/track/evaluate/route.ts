import { NextRequest, NextResponse } from "next/server";
import { trackerEvaluationRequestSchema } from "@/lib/schemas";
import type {
  CutoffStatus,
  TrackerEvaluationResponse,
  MovementDirection,
  Category,
  CountryBucket,
} from "@/types/database";

// ---------------------------------------------------------------------------
// NOTE: This endpoint performs client-side evaluation using a static cutoff
// map. It does not fetch from Supabase directly — instead, the frontend
// calls /api/bulletin/current (which is Supabase-backed) and passes results
// here. A future enhancement could have this endpoint fetch cutoffs from
// Supabase on-the-fly, but for now the static map is kept as-is.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mock cutoff map — matches /api/bulletin/current March 2026 data
// Key: `${chart_type}:${category}:${country_bucket}`
// ---------------------------------------------------------------------------

interface CutoffEntry {
  kind: "date" | "current" | "unavailable";
  date: string | null; // ISO YYYY-MM-DD
}

const CUTOFFS: Record<string, CutoffEntry> = {
  // Final Action
  "final_action:EB1:india":          { kind: "date",    date: "2022-02-01" },
  "final_action:EB1:china_mainland": { kind: "date",    date: "2022-06-01" },
  "final_action:EB1:all_other":      { kind: "current", date: null },
  "final_action:EB2:india":          { kind: "date",    date: "2012-09-01" },
  "final_action:EB2:china_mainland": { kind: "date",    date: "2020-12-01" },
  "final_action:EB2:all_other":      { kind: "current", date: null },
  "final_action:EB3:india":          { kind: "date",    date: "2012-06-08" },
  "final_action:EB3:china_mainland": { kind: "date",    date: "2020-01-01" },
  "final_action:EB3:all_other":      { kind: "current", date: null },
  // Dates for Filing
  "dates_for_filing:EB1:india":          { kind: "date",    date: "2022-08-01" },
  "dates_for_filing:EB1:china_mainland": { kind: "date",    date: "2023-01-01" },
  "dates_for_filing:EB1:all_other":      { kind: "current", date: null },
  "dates_for_filing:EB2:india":          { kind: "date",    date: "2013-06-01" },
  "dates_for_filing:EB2:china_mainland": { kind: "date",    date: "2021-06-01" },
  "dates_for_filing:EB2:all_other":      { kind: "current", date: null },
  "dates_for_filing:EB3:india":          { kind: "date",    date: "2013-01-01" },
  "dates_for_filing:EB3:china_mainland": { kind: "date",    date: "2020-09-01" },
  "dates_for_filing:EB3:all_other":      { kind: "current", date: null },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / msPerDay,
  );
}

function buildCutoffStatus(
  entry: CutoffEntry | undefined,
  priorityDate: string,
  chartLabel: string,
): CutoffStatus {
  if (!entry || entry.kind === "unavailable") {
    return {
      state: "unavailable",
      cutoff: null,
      distanceDays: null,
      explanation: `The ${chartLabel} chart shows this category/country combination as unavailable.`,
    };
  }

  if (entry.kind === "current") {
    return {
      state: "current",
      cutoff: null,
      distanceDays: 0,
      explanation: `The ${chartLabel} chart is Current for your category and country. All priority dates are eligible.`,
    };
  }

  // entry.kind === "date"
  const cutoff = entry.date!;
  const distance = daysBetween(priorityDate, cutoff);

  if (distance >= 0) {
    // cutoff >= priorityDate => priority date is current
    return {
      state: "ahead",
      cutoff,
      distanceDays: distance,
      explanation: `Your priority date (${priorityDate}) is ${distance} days ahead of the ${chartLabel} cutoff date (${cutoff}). You are eligible to proceed.`,
    };
  }

  // cutoff < priorityDate => still waiting
  const absDays = Math.abs(distance);
  return {
    state: "behind",
    cutoff,
    distanceDays: -absDays,
    explanation: `Your priority date (${priorityDate}) is ${absDays} days behind the ${chartLabel} cutoff date (${cutoff}). The cutoff must advance further before your date becomes current.`,
  };
}

function lookupCutoff(
  chartType: string,
  category: Category,
  country: CountryBucket,
): CutoffEntry | undefined {
  // Try exact match first, then fall back to all_other
  return (
    CUTOFFS[`${chartType}:${category}:${country}`] ??
    CUTOFFS[`${chartType}:${category}:all_other`]
  );
}

// ---------------------------------------------------------------------------
// POST /api/track/evaluate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = trackerEvaluationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { category, country, priorityDate, path } = parsed.data;

  const faEntry = lookupCutoff("final_action", category, country);
  const dfEntry = lookupCutoff("dates_for_filing", category, country);

  const finalAction = buildCutoffStatus(faEntry, priorityDate, "Final Action");
  const datesForFiling = buildCutoffStatus(
    dfEntry,
    priorityDate,
    "Dates for Filing",
  );

  // Mock month-over-month movement (matches history endpoint March 2026 row)
  const monthOverMonth: { finalActionDays: number; direction: MovementDirection } = {
    finalActionDays: 31,
    direction: "forward",
  };

  // Simple milestone logic based on distance
  const milestones = buildMilestones(finalAction, path);

  const response: TrackerEvaluationResponse = {
    scenario: { category, country, priorityDate, path },
    currentBulletin: {
      month: "2026-03",
      publishedAt: "2026-02-12T17:00:00.000Z",
    },
    status: { finalAction, datesForFiling },
    movement: { monthOverMonth },
    milestones,
    sources: [
      {
        label: "March 2026 Visa Bulletin",
        url: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html",
        publishedAt: "2026-02-12T17:00:00.000Z",
      },
      {
        label: "USCIS Filing Chart Selection - March 2026",
        url: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin",
        publishedAt: "2026-02-15T12:00:00.000Z",
      },
    ],
  };

  return NextResponse.json(response);
}

// ---------------------------------------------------------------------------
// Milestone builder
// ---------------------------------------------------------------------------

function buildMilestones(
  finalAction: CutoffStatus,
  path: string,
) {
  const cards = [];

  if (finalAction.state === "current" || finalAction.state === "ahead") {
    cards.push({
      slug: "eligible-to-file",
      title: "Eligible to File I-485 / DS-260",
      body:
        path === "AOS"
          ? "Your priority date is current under the Final Action chart. You may file Form I-485 (Adjustment of Status) with USCIS."
          : "Your priority date is current under the Final Action chart. You may proceed with consular processing (DS-260).",
      relevant: true,
    });
  }

  if (
    finalAction.state === "behind" &&
    finalAction.distanceDays !== null &&
    finalAction.distanceDays > -365
  ) {
    cards.push({
      slug: "within-one-year",
      title: "Within ~1 Year of Current",
      body: "Based on recent movement trends, your priority date may become current within approximately one year. Consider preparing documents now.",
      relevant: true,
    });
  }

  if (
    finalAction.state === "behind" &&
    finalAction.distanceDays !== null &&
    finalAction.distanceDays <= -365 &&
    finalAction.distanceDays > -1825
  ) {
    cards.push({
      slug: "multi-year-wait",
      title: "Multi-Year Wait Expected",
      body: "Your priority date is more than a year behind the cutoff. Historical movement for this category averages 1-3 months of advancement per bulletin month. Plan for a multi-year timeline.",
      relevant: true,
    });
  }

  if (
    finalAction.state === "behind" &&
    finalAction.distanceDays !== null &&
    finalAction.distanceDays <= -1825
  ) {
    cards.push({
      slug: "long-term-queue",
      title: "Long-Term Queue Position",
      body: "Your priority date is more than 5 years behind the current cutoff. Consider exploring alternative immigration pathways or EB category changes if eligible.",
      relevant: true,
    });
  }

  if (finalAction.state === "unavailable") {
    cards.push({
      slug: "category-unavailable",
      title: "Category Unavailable",
      body: "This category is currently marked as unavailable. No new applications are being accepted under this chart.",
      relevant: true,
    });
  }

  return cards;
}
