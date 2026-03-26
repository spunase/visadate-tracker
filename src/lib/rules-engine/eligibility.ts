/**
 * Type A Rules - Eligibility Evaluation
 *
 * Determines whether a user's priority date is "current" relative to a
 * visa bulletin cutoff date. Handles real dates, "C" (current for all),
 * and "U" (unavailable).
 */

import { differenceInCalendarDays } from "date-fns";
import type { CutoffValue, CutoffKind, EligibilityResult, StatusState } from "./types";

/**
 * Evaluate eligibility of a priority date against a single cutoff.
 *
 * @param priorityDate  The user's priority date.
 * @param cutoff        The cutoff value (Date | "C" | "U").
 * @param cutoffKind    Which chart this cutoff belongs to.
 * @returns             An EligibilityResult with state, distanceDays, and explanation.
 */
export function evaluateEligibility(
  priorityDate: Date,
  cutoff: CutoffValue,
  cutoffKind: CutoffKind,
): EligibilityResult {
  const chartLabel =
    cutoffKind === "final_action" ? "Final Action" : "Dates for Filing";

  // --- Symbolic: Current for all ---
  if (cutoff === "C") {
    return {
      state: "current",
      distanceDays: null,
      explanation: `The ${chartLabel} chart is "Current" (C) for this category, so all priority dates are current regardless of date.`,
    };
  }

  // --- Symbolic: Unavailable ---
  if (cutoff === "U") {
    return {
      state: "unavailable",
      distanceDays: null,
      explanation: `The ${chartLabel} chart is "Unavailable" (U) for this category. No filings are being accepted.`,
    };
  }

  // --- Date comparison ---
  // distanceDays: positive means the priority date is BEFORE the cutoff (user is current).
  // We define distance as cutoffDate − priorityDate so that:
  //   positive → priority date is before cutoff → current
  //   zero     → exactly on cutoff → current (cutoff means "before this date" but
  //              per USCIS convention the cutoff date itself is current)
  //   negative → priority date is after cutoff → not current
  const distanceDays = differenceInCalendarDays(cutoff, priorityDate);

  let state: StatusState;
  let explanation: string;

  if (distanceDays >= 0) {
    // User's date is on or before the cutoff → current
    if (cutoffKind === "dates_for_filing") {
      state = "filing_current";
      explanation =
        `Your priority date is ${distanceDays === 0 ? "exactly on" : `${distanceDays} day(s) before`} the ${chartLabel} cutoff. ` +
        `You are current for the filing chart, but this does not necessarily mean you are current for Final Action.`;
    } else {
      state = "current";
      explanation =
        `Your priority date is ${distanceDays === 0 ? "exactly on" : `${distanceDays} day(s) before`} the ${chartLabel} cutoff. ` +
        `You are current.`;
    }
  } else {
    state = "not_current";
    const behind = Math.abs(distanceDays);
    explanation =
      `Your priority date is ${behind} day(s) after the ${chartLabel} cutoff. ` +
      `You are not yet current.`;
  }

  return { state, distanceDays, explanation };
}
