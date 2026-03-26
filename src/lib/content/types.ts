/**
 * Content governance types for VisaDateTracker.
 *
 * Every piece of user-facing content is typed here so that disclaimers,
 * source attribution, and freshness metadata are enforced at compile time.
 *
 * @module content/types
 */

import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Disclaimers
// ---------------------------------------------------------------------------

/** The three disclaimer contexts used throughout the app. */
export type DisclaimerType = "global" | "milestone" | "news";

/** A single disclaimer constant shown to users. */
export interface Disclaimer {
  /** Stable identifier, e.g. "global" */
  id: string;
  /** Full legal-style text for prominent display. */
  text: string;
  /** Shorter version suitable for inline tooltips or banners. */
  shortText: string;
  /** Which context this disclaimer belongs to. */
  type: DisclaimerType;
}

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------

/** A single immigration-glossary entry. */
export interface GlossaryTerm {
  /** URL-safe slug, e.g. "priority-date". */
  id: string;
  /** Human-readable term name. */
  term: string;
  /** Plain-English definition (2-3 sentences). */
  definition: string;
  /** IDs of related glossary terms. */
  relatedTerms: string[];
  /** URL to the official USCIS / DOS page where the term is explained. */
  officialSource: string;
}

// ---------------------------------------------------------------------------
// Source Registry
// ---------------------------------------------------------------------------

/** Source trust tier - lower is more authoritative. */
export type SourceTier = 1 | 2 | 3;

/** Whether the source is a government entity or legal commentary. */
export type SourceType = "government" | "legal_commentary";

/** Trust level label derived from tier. */
export type TrustLevel = "authoritative" | "official" | "secondary";

/** Metadata for an allowed content source. */
export interface SourceInfo {
  /** Stable identifier, e.g. "uscis". */
  id: string;
  /** Display name. */
  name: string;
  /** Trust tier (1 = highest). */
  tier: SourceTier;
  /** Root URL used to match incoming links. */
  baseUrl: string;
  /** Classification. */
  type: SourceType;
  /** Human-readable trust label. */
  trustLevel: TrustLevel;
}

// ---------------------------------------------------------------------------
// Freshness
// ---------------------------------------------------------------------------

/** Freshness lifecycle of a piece of content. */
export type FreshnessStatus = "fresh" | "aging" | "stale" | "expired";

/** Content categories that have different freshness rules. */
export type ContentType = "bulletin" | "chart_use" | "policy" | "news";

/** Result returned by freshness-evaluation helpers. */
export interface FreshnessResult {
  status: FreshnessStatus;
  /** Number of full days since publication. */
  daysOld: number;
  /** Days until the content expires. Negative means already expired. */
  daysUntilExpiry: number;
  /** Optional warning string for UI display. */
  warningMessage: string | null;
}

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

/** High-level news categories. */
export type NewsCategory =
  | "uscis_official"
  | "dos_official"
  | "h1b_updates"
  | "eb_filing"
  | "fees_processing"
  | "policy_manual";

/** Editorial priority. */
export type NewsPriority = "high" | "medium" | "low";

/** Tags describing which user segment is affected. */
export type AffectedUserTag =
  | "h1b"
  | "eb1"
  | "eb2"
  | "eb3"
  | "aos"
  | "cp"
  | "all_eb";

/**
 * A single news item following the summarization contract.
 *
 * Every news item carries a mandatory source attribution and a stale-after
 * date so the UI can visually demote outdated content.
 */
export interface NewsItem {
  /** Unique identifier. */
  id: string;
  /** Short headline. */
  headline: string;
  /** 2-3 sentence plain-English summary. */
  summary: string;
  /** One-liner explaining why this matters to the user. */
  whyItMatters: string;
  /** Tags for the user segments affected. */
  affectedUserTags: AffectedUserTag[];
  /** Display name of the source (e.g. "USCIS"). */
  source: string;
  /** ISO-8601 publication date. */
  publishedDate: string;
  /** ISO-8601 date after which this item should be visually demoted. */
  staleAfterDate: string;
  /** News category for filtering. */
  category: NewsCategory;
  /** Editorial priority. */
  priority: NewsPriority;
  /** Direct URL to the official source document. */
  sourceUrl: string;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

/** Distance bands used to bucket priority-date proximity. */
export type MilestoneBand =
  | "far"
  | "approaching"
  | "near"
  | "very_near"
  | "filing_current"
  | "final_current";

/** Employment-based preference category. */
export type EBCategory = "EB1" | "EB2" | "EB3";

/** Filing path. */
export type FilingPath = "AOS" | "CP";

/** A single milestone card displayed in the timeline UI. */
export interface MilestoneCard {
  /** Unique identifier. */
  id: string;
  /** Which distance band this card belongs to. */
  band: MilestoneBand;
  /** Card title. */
  title: string;
  /** Card body (may contain markdown). */
  body: string;
  /** Actionable checklist items. */
  checklistItems: string[];
  /** URLs to official source material backing this guidance. */
  sourceRefs: string[];
  /** The disclaimer type that should accompany this card. */
  disclaimer: DisclaimerType;
  /** Which EB categories and filing paths this card applies to. */
  appliesTo: {
    categories: EBCategory[];
    paths: FilingPath[];
  };
}

// ---------------------------------------------------------------------------
// Zod Schemas (runtime validation)
// ---------------------------------------------------------------------------

export const NewsItemSchema = z.object({
  id: z.string(),
  headline: z.string(),
  summary: z.string(),
  whyItMatters: z.string(),
  affectedUserTags: z.array(
    z.enum(["h1b", "eb1", "eb2", "eb3", "aos", "cp", "all_eb"])
  ),
  source: z.string(),
  publishedDate: z.string(),
  staleAfterDate: z.string(),
  category: z.enum([
    "uscis_official",
    "dos_official",
    "h1b_updates",
    "eb_filing",
    "fees_processing",
    "policy_manual",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  sourceUrl: z.url(),
});

export const GlossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
  relatedTerms: z.array(z.string()),
  officialSource: z.url(),
});
