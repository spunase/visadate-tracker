/**
 * Rules Engine - Barrel Export
 *
 * Re-exports all public functions and types from the rules engine modules.
 */

// Types
export type {
  RuleType,
  StatusState,
  DistanceBand,
  MovementDirection,
  CutoffValue,
  CutoffKind,
  Category,
  ProcessingPath,
  EvaluationInput,
  EvaluationResult,
  EligibilityResult,
  MovementResult,
  MilestoneCard,
  ExplainabilityObject,
  MovementSummary,
} from "./types";

// Functions
export { evaluateEligibility } from "./eligibility";
export { evaluateMovement } from "./movement";
export { getMilestones, resolveBand } from "./milestones";
export { buildExplanation } from "./explainability";
export { evaluateScenario } from "./evaluate";
