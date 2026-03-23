/**
 * Calculate month-over-month movement between two Visa Bulletin cutoff rows.
 *
 * Computes movement_days, direction, retrogression, and no-change flags
 * by comparing the current month's cutoff with the previous month's cutoff.
 */

import type { DerivedMovement, ParsedCutoffRow } from "./types";

/**
 * Calculate the difference in days between two ISO date strings.
 * Returns positive if current is after previous (forward movement).
 */
function diffDays(currentDate: string, previousDate: string): number {
  const current = new Date(currentDate + "T00:00:00Z");
  const previous = new Date(previousDate + "T00:00:00Z");
  const diffMs = current.getTime() - previous.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate the derived monthly movement between two cutoff rows.
 *
 * Handles all combinations of date/current/unavailable transitions:
 *
 * | Previous   | Current    | Result                                 |
 * |------------|------------|----------------------------------------|
 * | date       | date       | Compare dates, compute day difference  |
 * | date       | current    | Forward to current (positive movement) |
 * | current    | date       | Retrogression from current             |
 * | current    | current    | No change                              |
 * | unavail    | date       | Forward (from unavailable)             |
 * | unavail    | current    | Forward (from unavailable to current)  |
 * | date       | unavail    | Backward (to unavailable)              |
 * | current    | unavail    | Backward (to unavailable)              |
 * | unavail    | unavail    | No change                              |
 *
 * @param currentRow - The current month's cutoff row
 * @param previousRow - The previous month's cutoff row
 * @returns Derived movement information
 */
export function calculateMovement(
  currentRow: ParsedCutoffRow,
  previousRow: ParsedCutoffRow
): DerivedMovement {
  const curKind = currentRow.cutoff_kind;
  const prevKind = previousRow.cutoff_kind;

  // Both unavailable → no change
  if (curKind === "unavailable" && prevKind === "unavailable") {
    return {
      movement_days: null,
      movement_direction: "unchanged",
      is_retrogression: false,
      is_no_change: true,
    };
  }

  // Both current → no change
  if (curKind === "current" && prevKind === "current") {
    return {
      movement_days: null,
      movement_direction: "unchanged",
      is_retrogression: false,
      is_no_change: true,
    };
  }

  // Date → Date: compute actual day difference
  if (curKind === "date" && prevKind === "date") {
    const days = diffDays(currentRow.cutoff_date!, previousRow.cutoff_date!);

    if (days === 0) {
      return {
        movement_days: 0,
        movement_direction: "unchanged",
        is_retrogression: false,
        is_no_change: true,
      };
    }

    return {
      movement_days: days,
      movement_direction: days > 0 ? "forward" : "backward",
      is_retrogression: days < 0,
      is_no_change: false,
    };
  }

  // Date → Current: forward movement (became current)
  if (curKind === "current" && prevKind === "date") {
    return {
      movement_days: null,
      movement_direction: "forward",
      is_retrogression: false,
      is_no_change: false,
    };
  }

  // Current → Date: retrogression (was current, now has a cutoff date)
  if (curKind === "date" && prevKind === "current") {
    return {
      movement_days: null,
      movement_direction: "backward",
      is_retrogression: true,
      is_no_change: false,
    };
  }

  // Unavailable → Date or Current: forward movement
  if (prevKind === "unavailable" && (curKind === "date" || curKind === "current")) {
    return {
      movement_days: null,
      movement_direction: "forward",
      is_retrogression: false,
      is_no_change: false,
    };
  }

  // Date or Current → Unavailable: backward movement
  if (curKind === "unavailable" && (prevKind === "date" || prevKind === "current")) {
    return {
      movement_days: null,
      movement_direction: "backward",
      is_retrogression: true,
      is_no_change: false,
    };
  }

  // Fallback (should not be reached with current types)
  return {
    movement_days: null,
    movement_direction: "unchanged",
    is_retrogression: false,
    is_no_change: true,
  };
}
