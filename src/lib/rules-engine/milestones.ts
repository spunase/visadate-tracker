/**
 * Type C Rules - Milestone Banding
 *
 * Given the distance in days between a priority date and a cutoff,
 * returns a set of MilestoneCards with guidance appropriate to the band.
 */

import type {
  Category,
  CutoffKind,
  DistanceBand,
  MilestoneCard,
  ProcessingPath,
} from "./types";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Determine which distance band the user falls into and return
 * the appropriate milestone cards.
 *
 * @param distanceDays  Output from eligibility evaluation. Positive = current.
 *                      null when cutoff is C or U.
 * @param category      User's preference category (e.g. "EB2").
 * @param path          User's processing path (AOS / CP).
 * @param cutoffKind    Which chart was used for the distance.
 * @returns             An array of MilestoneCards for the resolved band.
 */
export function getMilestones(
  distanceDays: number | null,
  category: Category,
  path: ProcessingPath | undefined,
  cutoffKind: CutoffKind,
): MilestoneCard[] {
  const band = resolveBand(distanceDays, cutoffKind);
  return buildCards(band, category, path ?? "AOS");
}

/**
 * Resolve a distance (in days) to a DistanceBand.
 * Exported for testing and reuse in the orchestrator.
 */
export function resolveBand(
  distanceDays: number | null,
  cutoffKind: CutoffKind,
): DistanceBand {
  // Symbolic states (C/U) yield null distance - handled at the cutoff level.
  // If the caller already determined the user is current, distanceDays >= 0.
  if (distanceDays === null) {
    // Treat null from Final Action as final_current, from Filing as filing_current.
    return cutoffKind === "final_action" ? "final_current" : "filing_current";
  }

  if (distanceDays >= 0 && cutoffKind === "final_action") return "final_current";
  if (distanceDays >= 0 && cutoffKind === "dates_for_filing") return "filing_current";

  // distanceDays is negative - user is behind the cutoff. Convert to positive months-behind.
  const absDays = Math.abs(distanceDays);
  const approxMonths = absDays / 30.44; // average days per month

  if (approxMonths >= 24) return "far";
  if (approxMonths >= 12) return "approaching";
  if (approxMonths >= 6) return "near";
  return "very_near";
}

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

const DISCLAIMER =
  "This guidance is informational only and does not constitute legal advice. Consult an immigration attorney for your specific situation.";

function buildCards(
  band: DistanceBand,
  category: Category,
  path: ProcessingPath,
): MilestoneCard[] {
  switch (band) {
    case "far":
      return farCards(category);
    case "approaching":
      return approachingCards(category, path);
    case "near":
      return nearCards(category, path);
    case "very_near":
      return veryNearCards(category, path);
    case "filing_current":
      return filingCurrentCards(category);
    case "final_current":
      return finalCurrentCards(category, path);
  }
}

function farCards(category: Category): MilestoneCard[] {
  return [
    {
      id: `${category}-far-understand-charts`,
      title: "Understand Final Action vs. Dates for Filing",
      body: "The visa bulletin publishes two charts each month. The Final Action chart determines when a visa can be issued. The Dates for Filing chart determines when you can submit your adjustment application (if USCIS accepts it). Learn the difference now so you can plan ahead.",
      sourceRefs: ["https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"],
      band: "far",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-far-track-patterns`,
      title: "Track Historical Movement Patterns",
      body: `Review how the ${category} cutoff has moved over the past 12-24 months. Understanding patterns - steady forward movement, stalls, or retrogressions - helps set realistic expectations for your timeline.`,
      sourceRefs: ["https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"],
      band: "far",
      disclaimer: DISCLAIMER,
    },
  ];
}

function approachingCards(category: Category, path: ProcessingPath): MilestoneCard[] {
  return [
    {
      id: `${category}-approaching-organize-docs`,
      title: "Organize Your Documents",
      body: "Start collecting civil documents (birth certificates, marriage certificates, police clearances) and ensure they are properly translated. Getting documents ready now avoids delays later.",
      sourceRefs: ["https://www.uscis.gov/i-485"],
      band: "approaching",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-approaching-learn-paths`,
      title: "Learn AOS vs. Consular Processing",
      body: `You are ${path === "AOS" ? "planning Adjustment of Status (AOS)" : "planning Consular Processing (CP)"}. Understand the trade-offs: AOS lets you file from within the US and may grant interim benefits (EAD, AP). CP is processed at a US consulate abroad and may be faster in some cases.`,
      sourceRefs: [
        "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
        "https://travel.state.gov/content/travel/en/us-visas/immigrate/immigrant-visa-process.html",
      ],
      band: "approaching",
      disclaimer: DISCLAIMER,
    },
  ];
}

function nearCards(category: Category, path: ProcessingPath): MilestoneCard[] {
  return [
    {
      id: `${category}-near-confirm-path`,
      title: "Confirm Your Processing Path",
      body: `Your priority date is within 6-12 months of the cutoff. Confirm whether you will pursue ${path === "AOS" ? "Adjustment of Status" : "Consular Processing"} and begin detailed preparation.`,
      sourceRefs: ["https://www.uscis.gov/i-485", "https://travel.state.gov"],
      band: "near",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-near-document-readiness`,
      title: "Ensure Document Readiness",
      body: "Verify that all required documents are current, translations are certified, and medical exams are scheduled (they are valid for two years for AOS). Check form editions - USCIS rejects outdated form versions.",
      sourceRefs: ["https://www.uscis.gov/i-693"],
      band: "near",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-near-follow-both-charts`,
      title: "Follow Both Charts Monthly",
      body: "At this stage, watch both the Final Action and Dates for Filing charts every month. USCIS announces which chart to use for AOS filings - this can change month to month.",
      sourceRefs: ["https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates"],
      band: "near",
      disclaimer: DISCLAIMER,
    },
  ];
}

function veryNearCards(category: Category, path: ProcessingPath): MilestoneCard[] {
  return [
    {
      id: `${category}-very-near-watch-bulletin`,
      title: "Watch the Bulletin Closely",
      body: "Your priority date is within 6 months of the cutoff. Check the visa bulletin as soon as it is released each month (typically mid-month for the following month).",
      sourceRefs: ["https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html"],
      band: "very_near",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-very-near-prepare-to-act`,
      title: "Prepare to Act Quickly",
      body: `Have your ${path === "AOS" ? "I-485 package" : "DS-260 and supporting documents"} ready to submit. When your date becomes current, you want to file immediately to lock in your place.`,
      sourceRefs: [
        path === "AOS" ? "https://www.uscis.gov/i-485" : "https://ceac.state.gov/iv",
      ],
      band: "very_near",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-very-near-confirm-fees`,
      title: "Confirm Forms and Fees",
      body: "Verify the current filing fee and form editions. USCIS periodically updates fees and form versions. Using the wrong version will result in rejection.",
      sourceRefs: ["https://www.uscis.gov/forms/filing-fees"],
      band: "very_near",
      disclaimer: DISCLAIMER,
    },
  ];
}

function filingCurrentCards(category: Category): MilestoneCard[] {
  return [
    {
      id: `${category}-filing-current-explain`,
      title: "Filing-Current Does Not Mean Approval",
      body: "Being current on the Dates for Filing chart means you may be able to submit your adjustment application - but it does not guarantee approval or that a visa number is immediately available. Final Action determines when your case can be approved.",
      sourceRefs: [
        "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates",
      ],
      band: "filing_current",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-filing-current-chart-use`,
      title: "Check Which Chart USCIS Is Accepting",
      body: "Each month, USCIS announces whether it will accept filings based on the Dates for Filing chart or the Final Action chart. Check the USCIS visa availability page to confirm before filing.",
      sourceRefs: [
        "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates",
      ],
      band: "filing_current",
      disclaimer: DISCLAIMER,
    },
  ];
}

function finalCurrentCards(category: Category, path: ProcessingPath): MilestoneCard[] {
  return [
    {
      id: `${category}-final-current-explain`,
      title: "You Are Current for Final Action",
      body: "Your priority date is current on the Final Action chart. This means a visa number is available for your category and country. You can proceed with the final step of your immigration process.",
      sourceRefs: [
        "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html",
      ],
      band: "final_current",
      disclaimer: DISCLAIMER,
    },
    {
      id: `${category}-final-current-filing-guide`,
      title: "Filing Instructions",
      body: `If you are pursuing ${path === "AOS" ? "Adjustment of Status, file Form I-485 with USCIS" : "Consular Processing, ensure your DS-260 is submitted and follow NVC instructions"}. Include all required supporting documents, medical examination results, and the correct filing fee.`,
      sourceRefs: [
        path === "AOS" ? "https://www.uscis.gov/i-485" : "https://ceac.state.gov/iv",
      ],
      band: "final_current",
      disclaimer: DISCLAIMER,
    },
  ];
}
