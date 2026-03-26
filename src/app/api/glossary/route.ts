import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// NOTE: Glossary terms are served from the static content library defined
// below. There is no corresponding Supabase table - this endpoint
// intentionally stays as-is with inline data.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Glossary terms for visa bulletin / green card tracking
// ---------------------------------------------------------------------------

interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  related: string[];
}

const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "priority-date",
    term: "Priority Date",
    definition:
      "The date that establishes your place in the green card queue. For employment-based cases, it is typically the date your PERM labor certification application was filed (or the I-140 receipt date if no PERM was required, e.g. EB-1A, EB-2 NIW).",
    related: ["final-action-date", "dates-for-filing", "retrogression"],
  },
  {
    slug: "final-action-date",
    term: "Final Action Date",
    definition:
      "The cutoff date on the visa bulletin's Chart A (Application Final Action Dates). If your priority date is earlier than this date, a visa number is available and USCIS can make a final decision on your I-485 or the consulate can schedule your interview.",
    related: ["priority-date", "dates-for-filing", "chart-use"],
  },
  {
    slug: "dates-for-filing",
    term: "Dates for Filing",
    definition:
      "The cutoff date on the visa bulletin's Chart B (Dates for Filing). If your priority date is earlier than this date, you may be able to file your I-485 application, even though a final visa number is not yet available. USCIS decides each month whether applicants may use this chart.",
    related: ["final-action-date", "chart-use", "priority-date"],
  },
  {
    slug: "current",
    term: "Current (C)",
    definition:
      "When a category/country shows 'C' (Current) on the visa bulletin, it means all priority dates are eligible - there is no backlog for that combination. Any applicant in that category and chargeability area can proceed.",
    related: ["unavailable", "final-action-date", "dates-for-filing"],
  },
  {
    slug: "unavailable",
    term: "Unavailable (U)",
    definition:
      "When a category/country shows 'U' (Unavailable) on the visa bulletin, no visa numbers are available and no new applications can be filed or approved under that chart for the remainder of the fiscal year.",
    related: ["current", "retrogression"],
  },
  {
    slug: "retrogression",
    term: "Retrogression",
    definition:
      "A backward movement of the cutoff date in the visa bulletin. This happens when demand for visa numbers exceeds supply, causing the State Department to move the date backward. Applicants who were previously current may no longer be eligible until the date advances again.",
    related: ["priority-date", "final-action-date"],
  },
  {
    slug: "chargeability",
    term: "Chargeability",
    definition:
      "The country to which an immigrant visa applicant is 'charged' for purposes of the per-country visa limits. This is generally based on the applicant's country of birth, not citizenship. Cross-chargeability allows using a spouse's country of birth if it has a shorter wait.",
    related: ["priority-date", "retrogression"],
  },
  {
    slug: "aos",
    term: "Adjustment of Status (AOS)",
    definition:
      "The process of applying for a green card while physically present in the United States, using Form I-485. This path allows applicants to remain in the US during processing and may provide interim work authorization (EAD) and travel permission (Advance Parole).",
    related: ["consular-processing", "final-action-date"],
  },
  {
    slug: "consular-processing",
    term: "Consular Processing (CP)",
    definition:
      "The process of applying for an immigrant visa at a US embassy or consulate abroad. After I-140 approval, the case is sent to the National Visa Center (NVC), and the applicant attends an interview at their designated consulate.",
    related: ["aos", "final-action-date"],
  },
  {
    slug: "chart-use",
    term: "Chart Use (USCIS Chart Selection)",
    definition:
      "Each month, USCIS announces whether I-485 applicants should use Chart A (Final Action Dates) or Chart B (Dates for Filing) to determine eligibility to file. This announcement typically comes shortly after the visa bulletin is published. If USCIS allows Chart B, more applicants may be able to file their I-485 earlier.",
    related: ["final-action-date", "dates-for-filing"],
  },
  {
    slug: "eb1",
    term: "EB-1 (First Preference)",
    definition:
      "Employment-based first preference category covering: EB-1A (extraordinary ability), EB-1B (outstanding professors and researchers), and EB-1C (multinational managers/executives). Generally has shorter wait times than EB-2 and EB-3.",
    related: ["eb2", "eb3", "priority-date"],
  },
  {
    slug: "eb2",
    term: "EB-2 (Second Preference)",
    definition:
      "Employment-based second preference category for professionals with advanced degrees or exceptional ability. Includes the EB-2 NIW (National Interest Waiver) subcategory which does not require employer sponsorship or PERM labor certification.",
    related: ["eb1", "eb3", "priority-date"],
  },
  {
    slug: "eb3",
    term: "EB-3 (Third Preference)",
    definition:
      "Employment-based third preference category for skilled workers (minimum 2 years training/experience), professionals (bachelor's degree), and other workers (unskilled labor requiring less than 2 years training).",
    related: ["eb1", "eb2", "priority-date"],
  },
];

// ---------------------------------------------------------------------------
// GET /api/glossary
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(
    {
      terms: GLOSSARY,
      count: GLOSSARY.length,
      _meta: {
        source: "static",
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    },
  );
}
