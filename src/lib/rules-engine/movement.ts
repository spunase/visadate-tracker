/**
 * Type B Rules - Movement Detection
 *
 * Compares the cutoff from the current bulletin against the previous
 * bulletin and determines the direction and magnitude of movement.
 */

import { differenceInCalendarDays } from "date-fns";
import type { CutoffValue, MovementDirection, MovementResult } from "./types";

/**
 * Evaluate how a cutoff has moved between two consecutive bulletins.
 *
 * @param currentCutoff   This month's cutoff.
 * @param previousCutoff  Last month's cutoff.
 * @returns               A MovementResult describing direction, magnitude, and summary.
 */
export function evaluateMovement(
  currentCutoff: CutoffValue,
  previousCutoff: CutoffValue,
): MovementResult {
  // --- Both symbolic and identical ---
  if (currentCutoff === "C" && previousCutoff === "C") {
    return noChange("The cutoff remains Current (C).");
  }
  if (currentCutoff === "U" && previousCutoff === "U") {
    return noChange("The cutoff remains Unavailable (U).");
  }

  // --- Transitions involving symbolic states ---
  if (previousCutoff === "U" && currentCutoff === "C") {
    return transition("became_current", null, "The cutoff changed from Unavailable to Current.");
  }
  if (previousCutoff === "U" && currentCutoff instanceof Date) {
    return transition("became_available", null, "The cutoff changed from Unavailable to a specific date - the category is now available.");
  }
  if (previousCutoff === "C" && currentCutoff === "U") {
    return transition("became_unavailable", null, "The cutoff changed from Current to Unavailable.");
  }
  if (previousCutoff === "C" && currentCutoff instanceof Date) {
    return transition("became_date", null, "The cutoff changed from Current (C) to a specific date - this is a retrogression from the current state.");
  }
  if (previousCutoff instanceof Date && currentCutoff === "C") {
    return transition("became_current", null, "The cutoff changed from a specific date to Current (C) - all dates are now current.");
  }
  if (previousCutoff instanceof Date && currentCutoff === "U") {
    return transition("became_unavailable", null, "The cutoff changed from a specific date to Unavailable (U).");
  }

  // --- Both are real dates ---
  if (previousCutoff instanceof Date && currentCutoff instanceof Date) {
    const days = differenceInCalendarDays(currentCutoff, previousCutoff);

    if (days > 0) {
      return {
        direction: "forward",
        days,
        isRetrogression: false,
        isNoChange: false,
        summary: `The cutoff moved forward by ${days} day(s).`,
      };
    }
    if (days < 0) {
      return {
        direction: "retrogressed",
        days,
        isRetrogression: true,
        isNoChange: false,
        summary: `The cutoff moved backward by ${Math.abs(days)} day(s) - this is a retrogression.`,
      };
    }
    return noChange("The cutoff date did not change from last month.");
  }

  // Fallback (should not happen with well-typed inputs)
  return noChange("Unable to determine movement.");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function noChange(summary: string): MovementResult {
  return {
    direction: "no_change",
    days: null,
    isRetrogression: false,
    isNoChange: true,
    summary,
  };
}

function transition(
  direction: MovementDirection,
  days: number | null,
  summary: string,
): MovementResult {
  return {
    direction,
    days,
    isRetrogression: direction === "became_unavailable" || direction === "became_date",
    isNoChange: false,
    summary,
  };
}
