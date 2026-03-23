/**
 * Rules Engine Types for VisaDateTracker
 *
 * All types powering the visa bulletin rules engine:
 * eligibility evaluation, movement detection, milestone banding,
 * and explainability.
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

/** The four rule categories the engine supports. */
export type RuleType = "A" | "B" | "C" | "D";

/** Eligibility status of a user's priority date relative to a cutoff. */
export type StatusState =
  | "current"
  | "filing_current"
  | "not_current"
  | "retrogressed"
  | "unavailable";

/** How far away the user is from the cutoff, bucketed into bands. */
export type DistanceBand =
  | "far"          // 24+ months
  | "approaching"  // 12-24 months
  | "near"         // 6-12 months
  | "very_near"    // 0-6 months
  | "filing_current"
  | "final_current";

/** Direction a cutoff moved between two bulletins. */
export type MovementDirection =
  | "forward"
  | "no_change"
  | "retrogressed"
  | "became_current"    // date → C
  | "became_date"       // C → date
  | "became_unavailable" // any → U
  | "became_available";  // U → date or C

/**
 * A cutoff value as it appears on a visa bulletin.
 * - A Date string (ISO) when a specific date is published.
 * - "C" when the category is current for everyone.
 * - "U" when the category is unavailable.
 */
export type CutoffValue = Date | "C" | "U";

/** Which chart the cutoff comes from. */
export type CutoffKind = "final_action" | "dates_for_filing";

/** Visa preference category. */
export type Category = "EB1" | "EB2" | "EB3" | "EB4" | "EB5" | string;

/** Processing path. */
export type ProcessingPath = "AOS" | "CP";

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/** Everything the engine needs to evaluate a single scenario. */
export interface EvaluationInput {
  /** User's priority date (always a real Date). */
  priorityDate: Date;
  /** The category, e.g. "EB2". */
  category: Category;
  /** Country of chargeability. */
  country: string;
  /** Current Final Action cutoff. */
  finalActionCutoff: CutoffValue;
  /** Current Dates for Filing cutoff. */
  datesForFilingCutoff: CutoffValue;
  /** Previous month's Final Action cutoff (for movement). */
  previousFinalActionCutoff?: CutoffValue;
  /** Previous month's Dates for Filing cutoff (for movement). */
  previousDatesForFilingCutoff?: CutoffValue;
  /** Bulletin month label, e.g. "March 2026". */
  bulletinMonth: string;
  /** User's chosen processing path. */
  path?: ProcessingPath;
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

/** Result of a Type A (eligibility) evaluation for one chart. */
export interface EligibilityResult {
  /** Resolved status. */
  state: StatusState;
  /** Distance in days. Positive means user is ahead of cutoff (current).
   *  Negative means behind. null when cutoff is C or U. */
  distanceDays: number | null;
  /** Human-readable explanation sentence. */
  explanation: string;
}

/** Result of a Type B (movement) evaluation for one chart. */
export interface MovementResult {
  direction: MovementDirection;
  /** Number of days the cutoff moved. Positive = forward, negative = backward.
   *  null when either side is C or U. */
  days: number | null;
  isRetrogression: boolean;
  isNoChange: boolean;
  summary: string;
}

/** A single milestone card (Type C). */
export interface MilestoneCard {
  id: string;
  title: string;
  body: string;
  sourceRefs: string[];
  band: DistanceBand;
  disclaimer: string;
}

/** The explainability audit trail attached to every evaluation. */
export interface ExplainabilityObject {
  /** What values were compared. */
  compared: {
    priorityDate: string;
    finalActionCutoff: string;
    datesForFilingCutoff: string;
    category: string;
    country: string;
    bulletinMonth: string;
  };
  /** What source was used. */
  source: string;
  /** What calculation was performed. */
  calculation: string;
  /** What result was produced. */
  result: string;
}

/** Combined movement summary across both charts. */
export interface MovementSummary {
  finalAction: MovementResult | null;
  datesForFiling: MovementResult | null;
}

/** The full evaluation result returned by evaluateScenario. */
export interface EvaluationResult {
  /** Type A results. */
  eligibility: {
    finalAction: EligibilityResult;
    datesForFiling: EligibilityResult;
  };
  /** Type B results. */
  movement: MovementSummary;
  /** Type C milestone cards. */
  milestones: MilestoneCard[];
  /** Explainability audit trail. */
  explanation: ExplainabilityObject;
  /** The resolved distance band for convenience. */
  band: DistanceBand;
}
