/**
 * Explainability Module
 *
 * Every evaluation must produce a human-readable audit trail describing:
 * what was compared, what source was used, what calculation was performed,
 * and what result was produced.
 */

import { format } from "date-fns";
import type {
  CutoffValue,
  EligibilityResult,
  EvaluationInput,
  ExplainabilityObject,
} from "./types";

/**
 * Build a full explainability object from the evaluation input and the
 * eligibility results for both charts.
 */
export function buildExplanation(
  input: EvaluationInput,
  finalActionResult: EligibilityResult,
  datesForFilingResult: EligibilityResult,
): ExplainabilityObject {
  const pdStr = format(input.priorityDate, "yyyy-MM-dd");
  const faStr = formatCutoff(input.finalActionCutoff);
  const dfStr = formatCutoff(input.datesForFilingCutoff);

  // Build the calculation narrative based on the Final Action result
  // (the primary chart).
  const calculation = buildCalculationNarrative(
    input,
    pdStr,
    faStr,
    finalActionResult,
  );

  const result = buildResultNarrative(
    finalActionResult,
    datesForFilingResult,
  );

  return {
    compared: {
      priorityDate: pdStr,
      finalActionCutoff: faStr,
      datesForFilingCutoff: dfStr,
      category: input.category,
      country: input.country,
      bulletinMonth: input.bulletinMonth,
    },
    source: `Visa Bulletin for ${input.bulletinMonth}, published by the U.S. Department of State.`,
    calculation,
    result,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCutoff(cutoff: CutoffValue): string {
  if (cutoff === "C") return "C (Current)";
  if (cutoff === "U") return "U (Unavailable)";
  return format(cutoff, "yyyy-MM-dd");
}

function buildCalculationNarrative(
  input: EvaluationInput,
  pdStr: string,
  faStr: string,
  faResult: EligibilityResult,
): string {
  if (input.finalActionCutoff === "C") {
    return `The ${input.category} ${input.country} Final Action cutoff for ${input.bulletinMonth} is Current (C). No date comparison is needed — all priority dates are current.`;
  }

  if (input.finalActionCutoff === "U") {
    return `The ${input.category} ${input.country} Final Action cutoff for ${input.bulletinMonth} is Unavailable (U). No filings are being accepted for this category.`;
  }

  const distance = faResult.distanceDays!;
  const direction = distance >= 0 ? "before" : "after";
  const absDays = Math.abs(distance);

  return (
    `Your ${input.category} ${input.country} priority date (${pdStr}) is compared against the ${input.bulletinMonth} Final Action cutoff (${faStr}). ` +
    `Your date is ${absDays} day(s) ${direction} the cutoff.`
  );
}

function buildResultNarrative(
  faResult: EligibilityResult,
  dfResult: EligibilityResult,
): string {
  const parts: string[] = [];

  // Final Action
  switch (faResult.state) {
    case "current":
      parts.push("You are current for Final Action.");
      break;
    case "not_current":
      parts.push(
        `You are not yet current for Final Action (${Math.abs(faResult.distanceDays!)} day(s) behind).`,
      );
      break;
    case "unavailable":
      parts.push("Final Action is unavailable for your category.");
      break;
    default:
      parts.push(`Final Action status: ${faResult.state}.`);
  }

  // Dates for Filing
  switch (dfResult.state) {
    case "filing_current":
    case "current":
      parts.push("You are current for Dates for Filing.");
      break;
    case "not_current":
      parts.push(
        `You are not yet current for Dates for Filing (${Math.abs(dfResult.distanceDays!)} day(s) behind).`,
      );
      break;
    case "unavailable":
      parts.push("Dates for Filing is unavailable for your category.");
      break;
    default:
      parts.push(`Dates for Filing status: ${dfResult.state}.`);
  }

  return parts.join(" ");
}
