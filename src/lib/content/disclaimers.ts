/**
 * User-facing disclaimers for VisaDateTracker.
 *
 * Three distinct disclaimer contexts ensure users always understand that this
 * app provides **informational tracking only** and is never a substitute for
 * qualified legal counsel.
 *
 * @module content/disclaimers
 */

import type { Disclaimer } from "./types";

/**
 * Shown on every page — the primary "not legal advice" notice.
 */
export const GLOBAL_DISCLAIMER: Disclaimer = {
  id: "global",
  text: "This app provides informational tracking only. It is not legal advice. Always verify with official sources.",
  shortText: "Informational only — not legal advice.",
  type: "global",
} as const;

/**
 * Shown alongside milestone / checklist cards.
 */
export const MILESTONE_DISCLAIMER: Disclaimer = {
  id: "milestone",
  text: "These are general preparation suggestions. Individual cases vary. Complex situations may require attorney review.",
  shortText: "General guidance — consult an attorney for complex cases.",
  type: "milestone",
} as const;

/**
 * Shown alongside news summaries.
 */
export const NEWS_DISCLAIMER: Disclaimer = {
  id: "news",
  text: "This summary highlights official updates. Read the official source before making any decisions.",
  shortText: "Read the official source before acting.",
  type: "news",
} as const;

/** All disclaimers keyed by type for convenient lookup. */
export const DISCLAIMERS: Record<string, Disclaimer> = {
  global: GLOBAL_DISCLAIMER,
  milestone: MILESTONE_DISCLAIMER,
  news: NEWS_DISCLAIMER,
};

/**
 * Retrieve the appropriate disclaimer for a given context.
 *
 * @param type - The disclaimer context.
 * @returns The matching {@link Disclaimer} or the global disclaimer as fallback.
 */
export function getDisclaimer(type: string): Disclaimer {
  return DISCLAIMERS[type] ?? GLOBAL_DISCLAIMER;
}
