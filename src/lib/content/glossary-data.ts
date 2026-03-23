/**
 * Immigration glossary for VisaDateTracker.
 *
 * Every term is written in plain English (2-3 sentences) so that applicants
 * who are new to the employment-based immigration process can understand
 * key concepts without needing a legal dictionary.
 *
 * @module content/glossary-data
 */

import type { GlossaryTerm } from "./types";

/**
 * Complete glossary covering all terms required by the content governance spec.
 *
 * Terms are sorted alphabetically by `id`.
 */
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "adjustment-of-status",
    term: "Adjustment of Status (AOS)",
    definition:
      "Adjustment of Status is the process of applying for lawful permanent resident status (a green card) while you are already physically present in the United States. You file Form I-485 with USCIS and remain in the U.S. while your application is processed. This path is an alternative to consular processing for those who are eligible.",
    relatedTerms: ["consular-processing", "final-action-date", "dates-for-filing"],
    officialSource: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
  },
  {
    id: "chargeability",
    term: "Chargeability",
    definition:
      "Chargeability determines which country's visa queue you fall under for immigration purposes. In most cases you are 'charged' to the country of your birth, not your citizenship. Certain exceptions exist — for example, you may be able to cross-charge to a spouse's country of birth if it has shorter wait times.",
    relatedTerms: ["priority-date", "visa-bulletin", "retrogression"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
  {
    id: "chart-use",
    term: "Chart-Use (Filing Chart vs Final Action Chart)",
    definition:
      "Each month USCIS decides whether applicants should use the 'Dates for Filing' chart or the 'Final Action Dates' chart from the Visa Bulletin to determine when they can submit their adjustment-of-status application. This decision — known as 'chart-use' — is published on the USCIS website and is only valid for that specific month. Checking the chart-use announcement is critical because it directly controls when you can file.",
    relatedTerms: ["dates-for-filing", "final-action-date", "visa-bulletin"],
    officialSource: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts",
  },
  {
    id: "consular-processing",
    term: "Consular Processing (CP)",
    definition:
      "Consular processing is the path to a green card for applicants who complete their immigrant visa interview at a U.S. embassy or consulate abroad. After your priority date becomes current on the Final Action Dates chart, the National Visa Center schedules your interview. This route is typically used by people who are outside the U.S. or who prefer not to file adjustment of status.",
    relatedTerms: ["adjustment-of-status", "final-action-date", "visa-bulletin"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process.html",
  },
  {
    id: "current",
    term: "Current (Visa Availability)",
    definition:
      "When a category and country combination shows 'C' (Current) on the Visa Bulletin, it means there is no backlog — a visa number is immediately available regardless of your priority date. Being current is the best-case scenario because it means you can file or have your case adjudicated right away.",
    relatedTerms: ["visa-bulletin", "retrogression", "priority-date"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
  {
    id: "dates-for-filing",
    term: "Dates for Filing",
    definition:
      "The 'Dates for Filing' chart in the monthly Visa Bulletin shows the earliest priority date that may file an adjustment-of-status application or be scheduled for a consular interview. These dates are typically more advanced (newer) than the Final Action Dates, meaning you may be able to file paperwork sooner. However, USCIS must authorize the use of this chart each month via their chart-use announcement.",
    relatedTerms: ["final-action-date", "chart-use", "visa-bulletin", "priority-date"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
  {
    id: "eb1",
    term: "EB-1 (Employment-Based First Preference)",
    definition:
      "EB-1 is the highest-priority employment-based green card category. It covers three sub-groups: EB-1A for individuals with extraordinary ability, EB-1B for outstanding professors and researchers, and EB-1C for multinational managers and executives. Because of its priority, EB-1 often has shorter wait times than EB-2 or EB-3, though backlogs can still occur for high-demand countries.",
    relatedTerms: ["eb2", "eb3", "priority-date", "visa-bulletin"],
    officialSource: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
  },
  {
    id: "eb2",
    term: "EB-2 (Employment-Based Second Preference)",
    definition:
      "EB-2 covers professionals holding an advanced degree (master's or higher) or persons with exceptional ability in their field. It also includes the EB-2 National Interest Waiver (NIW) sub-category, which allows self-petitioning without a job offer. EB-2 generally has moderate wait times, though India and China backlogs can be significant.",
    relatedTerms: ["eb1", "eb3", "priority-date", "visa-bulletin"],
    officialSource: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2",
  },
  {
    id: "eb3",
    term: "EB-3 (Employment-Based Third Preference)",
    definition:
      "EB-3 is for skilled workers (jobs requiring at least two years of training), professionals with a bachelor's degree, and other workers in unskilled positions. Wait times for EB-3 can be longer than EB-2 for some countries, but in certain periods EB-3 dates can actually move faster depending on demand patterns.",
    relatedTerms: ["eb1", "eb2", "priority-date", "visa-bulletin"],
    officialSource: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-third-preference-eb-3",
  },
  {
    id: "final-action-date",
    term: "Final Action Date",
    definition:
      "The Final Action Date (also called the 'Application Final Action Date') in the Visa Bulletin is the date when a visa number can actually be assigned and your green card application can be approved. Your priority date must be earlier than the Final Action Date for your category and country for USCIS or a consulate to take final action on your case.",
    relatedTerms: ["dates-for-filing", "priority-date", "visa-bulletin", "current"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
  {
    id: "priority-date",
    term: "Priority Date",
    definition:
      "Your priority date is essentially your place in line for an employment-based green card. For most EB categories it is the date your employer filed the PERM labor certification application (or for EB-1/NIW, the date the I-140 petition was filed). The Visa Bulletin compares your priority date against the published cutoff dates to determine whether a visa number is available for you.",
    relatedTerms: ["visa-bulletin", "final-action-date", "dates-for-filing"],
    officialSource: "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates",
  },
  {
    id: "retrogression",
    term: "Retrogression",
    definition:
      "Retrogression occurs when the cutoff dates in the Visa Bulletin move backward (become older) instead of advancing forward. This happens when demand for visa numbers exceeds the annual supply, forcing the State Department to slow down to stay within statutory limits. Retrogression can be frustrating because applicants who were previously eligible to file may suddenly become ineligible until dates advance again.",
    relatedTerms: ["visa-bulletin", "priority-date", "current", "final-action-date"],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
  {
    id: "visa-bulletin",
    term: "Visa Bulletin",
    definition:
      "The Visa Bulletin is a monthly publication by the U.S. Department of State that shows cutoff dates for immigrant visa availability. It contains two charts — Final Action Dates and Dates for Filing — organized by preference category and country of chargeability. Tracking the Visa Bulletin each month is the primary way employment-based applicants monitor their place in line.",
    relatedTerms: [
      "final-action-date",
      "dates-for-filing",
      "priority-date",
      "retrogression",
      "current",
    ],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
  },
];

/**
 * Look up a glossary term by its id.
 *
 * @param id - The term slug, e.g. "priority-date".
 * @returns The matching {@link GlossaryTerm} or `undefined`.
 */
export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === id);
}

/**
 * Return all glossary terms whose ids appear in the given array.
 *
 * Useful for resolving `relatedTerms` references.
 */
export function getRelatedTerms(ids: string[]): GlossaryTerm[] {
  const idSet = new Set(ids);
  return GLOSSARY_TERMS.filter((t) => idSet.has(t.id));
}
