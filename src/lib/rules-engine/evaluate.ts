/**
 * Main Orchestrator — evaluateScenario
 *
 * Combines eligibility (Type A), movement (Type B), milestones (Type C),
 * and explainability into a single EvaluationResult.
 */

import type {
  DistanceBand,
  EvaluationInput,
  EvaluationResult,
  MovementSummary,
} from "./types";
import { evaluateEligibility } from "./eligibility";
import { evaluateMovement } from "./movement";
import { getMilestones, resolveBand } from "./milestones";
import { buildExplanation } from "./explainability";

/**
 * Evaluate a complete visa tracking scenario.
 *
 * Pure function — no side effects, no API calls.
 *
 * @param input  Everything the engine needs (priority date, cutoffs, etc.)
 * @returns      A full EvaluationResult with eligibility, movement,
 *               milestones, band, and an explainability audit trail.
 */
export function evaluateScenario(input: EvaluationInput): EvaluationResult {
  // ---- Type A: Eligibility ----
  const finalAction = evaluateEligibility(
    input.priorityDate,
    input.finalActionCutoff,
    "final_action",
  );
  const datesForFiling = evaluateEligibility(
    input.priorityDate,
    input.datesForFilingCutoff,
    "dates_for_filing",
  );

  // ---- Type B: Movement ----
  const movement: MovementSummary = {
    finalAction:
      input.previousFinalActionCutoff !== undefined
        ? evaluateMovement(input.finalActionCutoff, input.previousFinalActionCutoff)
        : null,
    datesForFiling:
      input.previousDatesForFilingCutoff !== undefined
        ? evaluateMovement(input.datesForFilingCutoff, input.previousDatesForFilingCutoff)
        : null,
  };

  // ---- Resolve primary band (based on Final Action) ----
  const band: DistanceBand = resolveBand(
    finalAction.distanceDays,
    "final_action",
  );

  // ---- Type C: Milestones ----
  const milestones = getMilestones(
    finalAction.distanceDays,
    input.category,
    input.path,
    "final_action",
  );

  // ---- Explainability ----
  const explanation = buildExplanation(input, finalAction, datesForFiling);

  return {
    eligibility: { finalAction, datesForFiling },
    movement,
    milestones,
    explanation,
    band,
  };
}
