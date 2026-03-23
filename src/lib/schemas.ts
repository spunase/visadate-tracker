import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const categoryEnum = z.enum(["EB1", "EB2", "EB3", "Other_Workers"]);

export const countryBucketEnum = z.enum([
  "india",
  "china_mainland",
  "mexico",
  "philippines",
  "all_other",
]);

export const chartTypeEnum = z.enum(["final_action", "dates_for_filing"]);

export const cutoffKindEnum = z.enum(["date", "current", "unavailable"]);

export const validationStatusEnum = z.enum([
  "draft",
  "validated",
  "published",
  "superseded",
]);

export const movementDirectionEnum = z.enum([
  "forward",
  "backward",
  "unchanged",
]);

export const sourceTypeEnum = z.enum(["official", "secondary"]);

export const pathTypeEnum = z.enum(["AOS", "CP"]);

export const preferenceScopeEnum = z.enum(["employment_based"]);

// ---------------------------------------------------------------------------
// ISO-date helper
// ---------------------------------------------------------------------------

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected ISO date YYYY-MM-DD");

const isoDateTime = z.string().datetime();

const bulletinMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM format");

// ---------------------------------------------------------------------------
// Table schemas
// ---------------------------------------------------------------------------

export const visaBulletinSchema = z.object({
  id: z.string().uuid(),
  bulletin_month: bulletinMonth,
  source_url: z.string().url(),
  source_published_at: isoDateTime,
  raw_snapshot_path: z.string().nullable(),
  validation_status: validationStatusEnum,
  validated_at: isoDateTime.nullable(),
  created_at: isoDateTime,
});

export const visaCutoffRowSchema = z.object({
  id: z.string().uuid(),
  bulletin_id: z.string().uuid(),
  chart_type: chartTypeEnum,
  category: categoryEnum,
  country_bucket: countryBucketEnum,
  cutoff_kind: cutoffKindEnum,
  cutoff_date: isoDate.nullable(),
  original_value: z.string(),
  created_at: isoDateTime,
});

export const uscisChartSelectionSchema = z.object({
  id: z.string().uuid(),
  bulletin_month: bulletinMonth,
  preference_scope: preferenceScopeEnum,
  chart_to_use: chartTypeEnum,
  source_url: z.string().url(),
  source_published_at: isoDateTime,
  created_at: isoDateTime,
});

export const policyUpdateSchema = z.object({
  id: z.string().uuid(),
  topic: z.string(),
  subtopic: z.string().nullable(),
  title: z.string(),
  source_url: z.string().url(),
  publisher: z.string(),
  published_at: isoDateTime,
  summary: z.string(),
  why_it_matters: z.string(),
  freshness_expires_at: isoDateTime,
  source_type: sourceTypeEnum,
  is_active: z.boolean(),
  created_at: isoDateTime,
});

export const milestoneRuleSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  applies_to_categories: z.array(categoryEnum),
  applies_to_paths: z.array(pathTypeEnum),
  condition_expression: z.string(),
  body_md: z.string(),
  source_refs_json: z.record(z.string(), z.unknown()),
  last_validated_at: isoDateTime.nullable(),
  created_at: isoDateTime,
});

export const derivedMonthlyMovementSchema = z.object({
  id: z.string().uuid(),
  category: categoryEnum,
  country_bucket: countryBucketEnum,
  chart_type: chartTypeEnum,
  bulletin_month: bulletinMonth,
  prior_bulletin_month: bulletinMonth,
  movement_days: z.number().int(),
  movement_direction: movementDirectionEnum,
  is_retrogression: z.boolean(),
  is_no_change: z.boolean(),
  created_at: isoDateTime,
});

// ---------------------------------------------------------------------------
// Tracker evaluation request / response
// ---------------------------------------------------------------------------

export const trackerEvaluationRequestSchema = z.object({
  category: categoryEnum,
  country: countryBucketEnum,
  priorityDate: isoDate,
  path: pathTypeEnum,
});

const cutoffStatusSchema = z.object({
  state: z.enum(["current", "behind", "ahead", "unavailable"]),
  cutoff: isoDate.nullable(),
  distanceDays: z.number().int().nullable(),
  explanation: z.string(),
});

const milestoneCardSchema = z.object({
  slug: z.string(),
  title: z.string(),
  body: z.string(),
  relevant: z.boolean(),
});

const sourceReferenceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  publishedAt: isoDateTime,
});

export const trackerEvaluationResponseSchema = z.object({
  scenario: z.object({
    category: categoryEnum,
    country: countryBucketEnum,
    priorityDate: isoDate,
    path: pathTypeEnum,
  }),
  currentBulletin: z.object({
    month: bulletinMonth,
    publishedAt: isoDateTime,
  }),
  status: z.object({
    finalAction: cutoffStatusSchema,
    datesForFiling: cutoffStatusSchema,
  }),
  movement: z.object({
    monthOverMonth: z.object({
      finalActionDays: z.number().int(),
      direction: movementDirectionEnum,
    }),
  }),
  milestones: z.array(milestoneCardSchema),
  sources: z.array(sourceReferenceSchema),
});

// ---------------------------------------------------------------------------
// Inferred types (convenience re-exports)
// ---------------------------------------------------------------------------

export type VisaBulletinInput = z.input<typeof visaBulletinSchema>;
export type VisaCutoffRowInput = z.input<typeof visaCutoffRowSchema>;
export type TrackerEvaluationRequestInput = z.input<
  typeof trackerEvaluationRequestSchema
>;
export type TrackerEvaluationResponseInput = z.input<
  typeof trackerEvaluationResponseSchema
>;
