/**
 * News categorization and type guards for VisaDateTracker.
 *
 * Each news item follows the summarization contract: headline, summary,
 * why-it-matters, affected tags, source, dates, and a stale-after date.
 *
 * @module content/news-types
 */

import type {
  AffectedUserTag,
  NewsCategory,
  NewsItem,
  NewsPriority,
} from "./types";

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

interface NewsCategoryMeta {
  label: string;
  description: string;
  defaultPriority: NewsPriority;
}

/** Human-readable metadata for each news category. */
export const NEWS_CATEGORY_META: Record<NewsCategory, NewsCategoryMeta> = {
  uscis_official: {
    label: "USCIS Official",
    description: "Official announcements from U.S. Citizenship and Immigration Services.",
    defaultPriority: "high",
  },
  dos_official: {
    label: "Department of State",
    description: "Visa Bulletin releases and State Department notices.",
    defaultPriority: "high",
  },
  h1b_updates: {
    label: "H-1B Updates",
    description: "Lottery results, cap updates, and H-1B policy changes.",
    defaultPriority: "high",
  },
  eb_filing: {
    label: "EB Filing",
    description: "Employment-based filing date movements and priority date changes.",
    defaultPriority: "medium",
  },
  fees_processing: {
    label: "Fees & Processing",
    description: "Fee schedule changes and processing time updates.",
    defaultPriority: "medium",
  },
  policy_manual: {
    label: "Policy Manual",
    description: "USCIS Policy Manual updates and guidance changes.",
    defaultPriority: "low",
  },
};

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

/** Ordered list for sorting: index 0 = highest priority. */
const PRIORITY_ORDER: NewsPriority[] = ["high", "medium", "low"];

/**
 * Compare two news items by priority (descending) then by publication date
 * (most recent first).
 */
export function compareNewsByPriority(a: NewsItem, b: NewsItem): number {
  const pa = PRIORITY_ORDER.indexOf(a.priority);
  const pb = PRIORITY_ORDER.indexOf(b.priority);
  if (pa !== pb) return pa - pb;
  // More recent first
  return b.publishedDate.localeCompare(a.publishedDate);
}

// ---------------------------------------------------------------------------
// Filtering helpers
// ---------------------------------------------------------------------------

/**
 * Filter news items to those that affect at least one of the given user tags.
 */
export function filterNewsByTags(
  items: NewsItem[],
  tags: AffectedUserTag[]
): NewsItem[] {
  const tagSet = new Set(tags);
  return items.filter((item) =>
    item.affectedUserTags.some((t) => tagSet.has(t) || t === "all_eb")
  );
}

/**
 * Filter news items by category.
 */
export function filterNewsByCategory(
  items: NewsItem[],
  category: NewsCategory
): NewsItem[] {
  return items.filter((item) => item.category === category);
}

/**
 * Check whether a news item has gone stale relative to the given date.
 */
export function isNewsStale(item: NewsItem, now: Date = new Date()): boolean {
  return new Date(item.staleAfterDate) < now;
}
