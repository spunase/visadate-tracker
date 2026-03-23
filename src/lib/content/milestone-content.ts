/**
 * Milestone card library for VisaDateTracker.
 *
 * Each card is tied to a distance band (how far the user's priority date is
 * from the current cutoff) and provides actionable guidance with checklist
 * items and source references.
 *
 * All guidance carries the "milestone" disclaimer — these are general
 * preparation suggestions, not legal advice.
 *
 * @module content/milestone-content
 */

import type { MilestoneCard, MilestoneBand } from "./types";

/**
 * Complete milestone library — at least 3-4 cards per distance band.
 */
export const MILESTONE_CARDS: MilestoneCard[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // FAR — priority date is many years from the cutoff
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "far-01-understand-process",
    band: "far",
    title: "Understand the Employment-Based Green Card Process",
    body: "Your priority date is well behind the current cutoff dates. Use this time to thoroughly understand each step of the EB green card process — from labor certification (PERM) through I-140 approval to the final I-485 or consular processing stage.",
    checklistItems: [
      "Read the USCIS overview of employment-based immigration categories",
      "Identify your EB preference category (EB-1, EB-2, or EB-3)",
      "Confirm your priority date by reviewing your I-140 receipt notice",
      "Bookmark the monthly Visa Bulletin page",
    ],
    sourceRefs: [
      "https://www.uscis.gov/working-in-the-united-states/permanent-workers",
      "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "far-02-maintain-status",
    band: "far",
    title: "Maintain Valid Nonimmigrant Status",
    body: "While you wait, keeping your nonimmigrant status (e.g., H-1B, L-1) valid and uninterrupted is essential. Gaps in status can complicate your green card process later.",
    checklistItems: [
      "Track your current visa expiration and file timely extensions",
      "Keep copies of all I-797 approval notices",
      "Ensure your employer files H-1B extensions at least 6 months before expiry",
      "Understand the 3-year H-1B extension rule available after I-140 approval",
    ],
    sourceRefs: [
      "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "far-03-i140-approval",
    band: "far",
    title: "Ensure Your I-140 Is Approved",
    body: "If your I-140 petition has not yet been approved, work with your employer and attorney to track its status. An approved I-140 is the foundation of your green card case and enables important benefits like H-1B extensions beyond the 6-year limit.",
    checklistItems: [
      "Verify your I-140 filing receipt and priority date",
      "Consider requesting premium processing if available for your category",
      "Keep a personal copy of the I-140 approval notice",
      "Discuss I-140 portability rules with your attorney if you may change jobs",
    ],
    sourceRefs: [
      "https://www.uscis.gov/forms/explore-my-options/petition-for-an-immigrant-worker",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "far-04-document-prep",
    band: "far",
    title: "Begin Long-Lead Document Collection",
    body: "Some documents take weeks or months to obtain — especially from overseas. Starting early avoids last-minute scrambles when your date gets closer.",
    checklistItems: [
      "Obtain birth certificates for yourself and all dependents",
      "Gather marriage certificate and any divorce/death certificates if applicable",
      "Start the process for police clearance certificates from countries where you lived",
      "Organize educational credential evaluations if needed",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-485",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // APPROACHING — cutoff is getting closer (within a few years)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "approaching-01-monitor-bulletin",
    band: "approaching",
    title: "Actively Monitor the Visa Bulletin",
    body: "As your priority date gets within a few years of the cutoff, monthly Visa Bulletin tracking becomes critical. Date movements can accelerate or retrogress unpredictably.",
    checklistItems: [
      "Set a reminder to check the Visa Bulletin on or around the 15th of each month",
      "Track both the Final Action Date and Dates for Filing charts",
      "Note USCIS chart-use announcements for the upcoming month",
      "Watch for any mid-month corrections or special announcements",
    ],
    sourceRefs: [
      "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
      "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "approaching-02-choose-path",
    band: "approaching",
    title: "Decide: Adjustment of Status vs. Consular Processing",
    body: "Now is the time to decide whether you will file for Adjustment of Status (I-485, inside the U.S.) or go through Consular Processing (interview at a U.S. embassy abroad). Each path has different timelines, requirements, and trade-offs.",
    checklistItems: [
      "Discuss AOS vs. CP pros and cons with your attorney",
      "Consider whether you or dependents need to travel frequently (AOS may require Advance Parole)",
      "Evaluate processing times at your local USCIS office vs. the relevant consulate",
      "Factor in whether you want concurrent EAD/AP benefits through AOS",
    ],
    sourceRefs: [
      "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process.html",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "approaching-03-financial-prep",
    band: "approaching",
    title: "Financial Preparation",
    body: "Green card filing involves significant fees — USCIS filing fees, medical exam costs, attorney fees, and potentially premium processing. Budget ahead so finances do not delay your filing.",
    checklistItems: [
      "Estimate total filing costs (I-485, I-765 EAD, I-131 AP, medical exam)",
      "Clarify which fees your employer will cover vs. personal responsibility",
      "Set aside funds for potential premium processing if it becomes available",
      "Budget for dependent filings (each family member files separately)",
    ],
    sourceRefs: [
      "https://www.uscis.gov/forms/filing-fees",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "approaching-04-employer-communication",
    band: "approaching",
    title: "Coordinate with Your Employer",
    body: "Your employer plays a key role in the green card process. Proactive communication ensures they are prepared to provide necessary documentation and support when your date nears.",
    checklistItems: [
      "Confirm your employer's continued sponsorship",
      "Request an updated job description matching your I-140 petition",
      "Discuss the timeline and any internal HR processes",
      "Ask whether the company uses an immigration attorney or if you need your own",
    ],
    sourceRefs: [
      "https://www.uscis.gov/working-in-the-united-states/permanent-workers",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NEAR — within about a year of current
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "near-01-civil-surgeon",
    band: "near",
    title: "Schedule Your Medical Examination",
    body: "The I-693 medical examination is required for AOS applicants and must be performed by a USCIS-designated civil surgeon. Results are valid for two years from the date of the civil surgeon's signature, so timing matters.",
    checklistItems: [
      "Find a USCIS-designated civil surgeon near you",
      "Schedule the exam — popular civil surgeons may have multi-week wait times",
      "Bring your vaccination records to the appointment",
      "Obtain the sealed I-693 envelope (do not open it)",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-693",
      "https://my.uscis.gov/findadoctor",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "near-02-document-finalize",
    band: "near",
    title: "Finalize All Supporting Documents",
    body: "With your priority date approaching, make sure every required document is in hand, translated (if necessary), and ready to file. Missing documents are a common cause of RFEs (Requests for Evidence).",
    checklistItems: [
      "Verify all civil documents have certified English translations",
      "Obtain recent passport-style photographs meeting USCIS specifications",
      "Prepare a detailed employment history for the I-485",
      "Collect evidence of maintained nonimmigrant status (I-94 records, pay stubs)",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-485",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "near-03-understand-chart-use",
    band: "near",
    title: "Understand Chart-Use and Filing Windows",
    body: "USCIS decides each month whether AOS applicants can use the more favorable Dates for Filing chart. When your date is close, a single month's chart-use decision can mean the difference between filing now and waiting longer.",
    checklistItems: [
      "Check the USCIS chart-use announcement as soon as it is posted each month",
      "Compare your priority date against both charts",
      "If Dates for Filing is authorized and your date is current, be ready to file immediately",
      "Keep your attorney informed of chart-use changes",
    ],
    sourceRefs: [
      "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "near-04-cp-nvc",
    band: "near",
    title: "National Visa Center Preparation (Consular Processing)",
    body: "If you are pursuing consular processing, the NVC will contact you when your priority date is approaching. Being document-ready when NVC reaches out can significantly reduce wait times.",
    checklistItems: [
      "Create your CEAC account at the NVC portal",
      "Prepare DS-260 immigrant visa application responses",
      "Collect and scan all required civil documents",
      "Pay the immigrant visa processing fee promptly when invoiced",
    ],
    sourceRefs: [
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/collect-and-submit-forms-and-documents-to-the-nvc.html",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["CP"] },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VERY NEAR — within a few months
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "very-near-01-attorney-review",
    band: "very_near",
    title: "Attorney Review of Complete Filing Package",
    body: "Before submitting, have your attorney (or a qualified immigration professional) review every form and document. Errors on the I-485 or supporting evidence are a leading cause of delays and RFEs.",
    checklistItems: [
      "Schedule a review session with your attorney at least 2-3 weeks before expected filing",
      "Double-check that all form entries are consistent across documents",
      "Verify that the correct USCIS filing fees are included",
      "Confirm the correct USCIS lockbox mailing address for your jurisdiction",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-485",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "very-near-02-ead-ap",
    band: "very_near",
    title: "Prepare EAD and Advance Parole Applications",
    body: "When filing I-485, you can concurrently file I-765 (Employment Authorization) and I-131 (Advance Parole). These give you work flexibility and the ability to travel while your AOS is pending.",
    checklistItems: [
      "Complete Form I-765 (Application for Employment Authorization)",
      "Complete Form I-131 (Application for Travel Document)",
      "Prepare passport photos for each application",
      "Understand that using AP to re-enter may affect your H-1B status",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-765",
      "https://www.uscis.gov/i-131",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "very-near-03-retrogression-risk",
    band: "very_near",
    title: "Prepare for Possible Retrogression",
    body: "Dates can move backward without warning, especially near fiscal year boundaries (October) or when demand surges. Have a contingency plan in case your filing window closes unexpectedly.",
    checklistItems: [
      "Have your full I-485 package ready to mail on short notice",
      "Discuss with your attorney whether to file as soon as the window opens",
      "Understand that September and October are high-risk months for retrogression",
      "Keep your H-1B or other nonimmigrant status valid as a fallback",
    ],
    sourceRefs: [
      "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "very-near-04-dependent-filing",
    band: "very_near",
    title: "Prepare Dependent Applications",
    body: "Your spouse and unmarried children under 21 can file I-485 concurrently with you. Each dependent needs their own complete set of forms and documents.",
    checklistItems: [
      "Complete separate I-485 for each dependent",
      "Schedule medical exams (I-693) for each dependent",
      "Prepare dependent-specific documents (marriage certificate, birth certificates)",
      "File I-765 and I-131 for dependents who need work authorization or travel",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-485",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FILING CURRENT — Dates for Filing chart shows your date as current
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "filing-current-01-submit",
    band: "filing_current",
    title: "Submit Your I-485 Application",
    body: "Your priority date is current on the Dates for Filing chart and USCIS has authorized its use. File your I-485 as soon as possible — filing windows can close if dates retrogress next month.",
    checklistItems: [
      "Verify that USCIS has authorized the Dates for Filing chart for this month",
      "Confirm your priority date is before the published cutoff date",
      "Mail or e-file the complete I-485 package with correct fees",
      "Send via a trackable delivery method and save the tracking number",
    ],
    sourceRefs: [
      "https://www.uscis.gov/i-485",
      "https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "filing-current-02-receipt-tracking",
    band: "filing_current",
    title: "Track Your Receipt Notice",
    body: "After filing, USCIS will send receipt notices (I-797C) for each form. These contain your case numbers, which you need to track your case online.",
    checklistItems: [
      "Watch for receipt notices in the mail (typically 2-4 weeks after filing)",
      "Create a USCIS online account and link your receipt numbers",
      "Set up case status update notifications",
      "Keep copies of all receipt notices in a safe place",
    ],
    sourceRefs: [
      "https://egov.uscis.gov/casestatus/landing.do",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "filing-current-03-biometrics",
    band: "filing_current",
    title: "Prepare for Biometrics Appointment",
    body: "USCIS will schedule a biometrics appointment at an Application Support Center (ASC) near you. This is typically required for fingerprinting and photograph capture for background checks.",
    checklistItems: [
      "Watch for the biometrics appointment notice (Form I-797C)",
      "Attend the appointment on time — bring the notice and a valid photo ID",
      "If you cannot attend on the scheduled date, reschedule promptly",
      "Biometrics are usually scheduled within 3-6 weeks of receipt",
    ],
    sourceRefs: [
      "https://www.uscis.gov/forms/filing-guidance/preparing-for-your-biometric-services-appointment",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "filing-current-04-cp-interview",
    band: "filing_current",
    title: "Prepare for Consular Interview",
    body: "For consular processing applicants, when your priority date is current on the Final Action Dates chart, the NVC will schedule your interview at the designated U.S. embassy or consulate.",
    checklistItems: [
      "Complete any remaining NVC document submissions",
      "Review your DS-260 answers for accuracy before the interview",
      "Gather original documents to bring to the interview",
      "Obtain the required medical examination from a panel physician",
    ],
    sourceRefs: [
      "https://travel.state.gov/content/travel/en/us-visas/immigrate/the-immigrant-visa-process/interview.html",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["CP"] },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // FINAL CURRENT — Final Action Date shows your date as current
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "final-current-01-approval-watch",
    band: "final_current",
    title: "Watch for Case Approval",
    body: "With your date current on the Final Action Dates chart, USCIS can adjudicate your I-485. Case approvals can happen at any time — keep your case information and notifications up to date.",
    checklistItems: [
      "Check your USCIS case status regularly",
      "Ensure your mailing address is current with USCIS (file AR-11 if you moved)",
      "Be ready to respond quickly to any RFE (Request for Evidence)",
      "Keep your phone line available — USCIS may call for an interview scheduling",
    ],
    sourceRefs: [
      "https://egov.uscis.gov/casestatus/landing.do",
      "https://www.uscis.gov/addresschange",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "final-current-02-interview-prep",
    band: "final_current",
    title: "Prepare for a Possible AOS Interview",
    body: "Some employment-based AOS cases are called for an in-person interview at your local USCIS field office. Not all EB cases require one, but you should be prepared.",
    checklistItems: [
      "Bring original documents matching everything filed with your I-485",
      "Bring your valid passport and any previous I-94 records",
      "Prepare to answer questions about your employment and immigration history",
      "Bring a copy of your I-140 approval and employer support letter",
    ],
    sourceRefs: [
      "https://www.uscis.gov/green-card/green-card-processes-and-procedures/adjustment-of-status",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS"] },
  },
  {
    id: "final-current-03-green-card-received",
    band: "final_current",
    title: "After Approval: Receive Your Green Card",
    body: "Once approved, USCIS will order your physical green card. It typically arrives by mail within 2-3 weeks. Verify all information on the card immediately.",
    checklistItems: [
      "Watch for a card-production-ordered status update online",
      "Verify your name, date of birth, and other details on the card when received",
      "Report any errors to USCIS immediately using the online service request",
      "Understand your conditional vs. permanent residence status if applicable",
    ],
    sourceRefs: [
      "https://www.uscis.gov/green-card/after-we-grant-your-green-card",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
  {
    id: "final-current-04-post-approval",
    band: "final_current",
    title: "Post-Approval Obligations",
    body: "Becoming a permanent resident comes with ongoing obligations. Understanding these from day one helps you maintain your status and plan for the future.",
    checklistItems: [
      "Apply for a Social Security card or update your existing one",
      "Understand the requirement to carry your green card at all times",
      "File a change-of-address (AR-11) within 10 days of any move",
      "Note your conditional residence expiry date (if applicable) and plan for I-751 removal of conditions",
    ],
    sourceRefs: [
      "https://www.uscis.gov/green-card/after-we-grant-your-green-card/maintaining-permanent-residence",
    ],
    disclaimer: "milestone",
    appliesTo: { categories: ["EB1", "EB2", "EB3"], paths: ["AOS", "CP"] },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve all milestone cards for a specific distance band.
 *
 * @param band - The distance band to filter by.
 * @returns All milestone cards matching the band.
 */
export function getMilestonesByBand(band: MilestoneBand): MilestoneCard[] {
  return MILESTONE_CARDS.filter((m) => m.band === band);
}

/**
 * Retrieve milestone cards that apply to a specific EB category and filing path.
 */
export function getMilestonesForUser(
  band: MilestoneBand,
  category: "EB1" | "EB2" | "EB3",
  path: "AOS" | "CP"
): MilestoneCard[] {
  return MILESTONE_CARDS.filter(
    (m) =>
      m.band === band &&
      m.appliesTo.categories.includes(category) &&
      m.appliesTo.paths.includes(path)
  );
}
