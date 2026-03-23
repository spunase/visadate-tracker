/**
 * Content governance module for VisaDateTracker.
 *
 * This barrel re-exports all content-related types, constants, and helpers
 * used across the application. Every piece of user-facing content flows
 * through this module to ensure proper disclaimers, source attribution,
 * freshness evaluation, and tier enforcement.
 *
 * @module content
 */

// Types
export type {
  Disclaimer,
  DisclaimerType,
  GlossaryTerm,
  SourceInfo,
  SourceTier,
  SourceType,
  TrustLevel,
  FreshnessStatus,
  FreshnessResult,
  ContentType,
  NewsCategory,
  NewsPriority,
  AffectedUserTag,
  NewsItem,
  MilestoneBand,
  MilestoneCard,
  EBCategory,
  FilingPath,
} from "./types";

export { NewsItemSchema, GlossaryTermSchema } from "./types";

// Disclaimers
export {
  GLOBAL_DISCLAIMER,
  MILESTONE_DISCLAIMER,
  NEWS_DISCLAIMER,
  DISCLAIMERS,
  getDisclaimer,
} from "./disclaimers";

// Glossary
export {
  GLOSSARY_TERMS,
  getGlossaryTerm,
  getRelatedTerms,
} from "./glossary-data";

// Source Registry
export {
  ALLOWED_SOURCES,
  isAllowedSource,
  getSourceTier,
  getSourceMetadata,
} from "./source-registry";

// Freshness
export {
  evaluateFreshness,
  getBulletinFreshness,
  getChartUseFreshness,
  getPolicyFreshness,
} from "./freshness";

// News
export {
  NEWS_CATEGORY_META,
  compareNewsByPriority,
  filterNewsByTags,
  filterNewsByCategory,
  isNewsStale,
} from "./news-types";

// Milestones
export {
  MILESTONE_CARDS,
  getMilestonesByBand,
  getMilestonesForUser,
} from "./milestone-content";
