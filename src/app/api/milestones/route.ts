import { NextRequest, NextResponse } from "next/server";
import type { Category, CountryBucket, PathType, MilestoneCard } from "@/types/database";

// ---------------------------------------------------------------------------
// NOTE: Milestones are computed client-side from static rule definitions in
// this file. There is no corresponding Supabase table to fetch from - this
// endpoint intentionally stays as-is with inline rules.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Milestone rule definitions
// ---------------------------------------------------------------------------

interface MilestoneRuleDef {
  slug: string;
  title: string;
  applies_to_categories: Category[];
  applies_to_paths: PathType[];
  /** Evaluates whether this milestone is relevant given the distance in days */
  isRelevant: (distanceDays: number | null, state: string) => boolean;
  body: (path: PathType) => string;
}

const RULES: MilestoneRuleDef[] = [
  {
    slug: "priority-date-current",
    title: "Priority Date Is Current",
    applies_to_categories: ["EB1", "EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS", "CP"],
    isRelevant: (_d, state) => state === "current" || state === "ahead",
    body: (path) =>
      path === "AOS"
        ? "Your priority date is current. You are eligible to file Form I-485 (Adjustment of Status) if you have not already done so. Ensure your I-140 is approved and gather civil documents, medical exam (I-693), and employment verification."
        : "Your priority date is current. You are eligible to schedule a consular interview (DS-260). Ensure your I-140 is approved and the National Visa Center has received all documents.",
  },
  {
    slug: "dates-for-filing-eligible",
    title: "Eligible Under Dates for Filing Chart",
    applies_to_categories: ["EB1", "EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS"],
    isRelevant: (d, state) =>
      state === "behind" && d !== null && d > -180,
    body: () =>
      "Even though the Final Action date has not reached your priority date, you may be eligible to file I-485 under the Dates for Filing chart (if USCIS accepts it this month). Check the USCIS chart-use announcement.",
  },
  {
    slug: "prepare-documents",
    title: "Start Preparing Documents",
    applies_to_categories: ["EB1", "EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS", "CP"],
    isRelevant: (d, state) =>
      state === "behind" && d !== null && d > -365,
    body: (path) =>
      path === "AOS"
        ? "Your priority date is within approximately one year of becoming current. Start gathering: birth certificates, passport copies, I-94 records, civil documents, and schedule your medical exam (I-693, valid for 2 years)."
        : "Your priority date is within approximately one year of becoming current. Start gathering: birth certificates, passport copies, police clearances for consular processing, and ensure your DS-260 is up to date.",
  },
  {
    slug: "ead-renewal-planning",
    title: "Plan EAD / AP Renewals",
    applies_to_categories: ["EB1", "EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS"],
    isRelevant: (d, state) =>
      state === "behind" && d !== null && d <= -365 && d > -1825,
    body: () =>
      "With a multi-year wait, if you have a pending I-485, keep your EAD (I-765) and Advance Parole (I-131) current. File renewals 6 months before expiry to maintain work/travel authorization.",
  },
  {
    slug: "explore-alternatives",
    title: "Consider Alternative Pathways",
    applies_to_categories: ["EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS", "CP"],
    isRelevant: (d, state) =>
      state === "behind" && d !== null && d <= -1825,
    body: () =>
      "Your priority date is more than 5 years behind the cutoff. Consider: (1) EB-1 if you qualify for extraordinary ability or multinational manager, (2) EB-2 NIW for national interest waiver, (3) checking if porting your priority date to a different category is beneficial.",
  },
  {
    slug: "retrogression-alert",
    title: "Retrogression Risk",
    applies_to_categories: ["EB1", "EB2", "EB3", "Other_Workers"],
    applies_to_paths: ["AOS", "CP"],
    isRelevant: (d, state) =>
      state === "ahead" && d !== null && d < 60,
    body: () =>
      "Your priority date is barely current. Visa bulletin dates can move backward (retrogress), especially near the end of the fiscal year (July-September). File I-485 as soon as possible to lock in your application.",
  },
];

// ---------------------------------------------------------------------------
// GET /api/milestones?category=EB2&country=india&priorityDate=2013-03-15&path=AOS
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = (searchParams.get("category") ?? "EB2") as Category;
  const country = (searchParams.get("country") ?? "india") as CountryBucket;
  const priorityDate = searchParams.get("priorityDate") ?? "2013-03-15";
  const path = (searchParams.get("path") ?? "AOS") as PathType;

  // Mock cutoff lookup (same as current bulletin March 2026)
  const cutoffMap: Record<string, string | null> = {
    "EB1:india": "2022-02-01",
    "EB2:india": "2012-09-01",
    "EB3:india": "2012-06-08",
    "EB1:china_mainland": "2022-06-01",
    "EB2:china_mainland": "2020-12-01",
    "EB3:china_mainland": "2020-01-01",
    "EB1:all_other": null,
    "EB2:all_other": null,
    "EB3:all_other": null,
  };

  const cutoff = cutoffMap[`${category}:${country}`] ?? cutoffMap[`${category}:all_other`];

  let state: string;
  let distanceDays: number | null;

  if (cutoff === null || cutoff === undefined) {
    state = "current";
    distanceDays = 0;
  } else {
    const msPerDay = 86_400_000;
    distanceDays = Math.round(
      (new Date(cutoff).getTime() - new Date(priorityDate).getTime()) / msPerDay,
    );
    state = distanceDays >= 0 ? "ahead" : "behind";
  }

  const milestones: MilestoneCard[] = RULES.filter(
    (rule) =>
      rule.applies_to_categories.includes(category) &&
      rule.applies_to_paths.includes(path) &&
      rule.isRelevant(distanceDays, state),
  ).map((rule) => ({
    slug: rule.slug,
    title: rule.title,
    body: rule.body(path),
    relevant: true,
  }));

  return NextResponse.json({
    scenario: { category, country, priorityDate, path },
    cutoff,
    state,
    distanceDays,
    milestones,
    _meta: {
      source: "mock",
      generatedAt: new Date().toISOString(),
    },
  });
}
