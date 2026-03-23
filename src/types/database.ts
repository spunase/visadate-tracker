// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type Category = "EB1" | "EB2" | "EB3" | "Other_Workers";

export type CountryBucket =
  | "india"
  | "china_mainland"
  | "mexico"
  | "philippines"
  | "all_other";

export type ChartType = "final_action" | "dates_for_filing";

export type CutoffKind = "date" | "current" | "unavailable";

export type ValidationStatus =
  | "draft"
  | "validated"
  | "published"
  | "superseded";

export type MovementDirection = "forward" | "backward" | "unchanged";

export type SourceType = "official" | "secondary";

export type PathType = "AOS" | "CP";

export type PreferenceScope = "employment_based";

// ---------------------------------------------------------------------------
// Table interfaces
// ---------------------------------------------------------------------------

export interface VisaBulletin {
  id: string;
  bulletin_month: string; // YYYY-MM
  source_url: string;
  source_published_at: string; // ISO 8601
  raw_snapshot_path: string | null;
  validation_status: ValidationStatus;
  validated_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
}

export interface VisaCutoffRow {
  id: string;
  bulletin_id: string;
  chart_type: ChartType;
  category: Category;
  country_bucket: CountryBucket;
  cutoff_kind: CutoffKind;
  cutoff_date: string | null; // ISO 8601 date (YYYY-MM-DD) or null
  original_value: string; // value as it appeared in the source
  created_at: string;
}

export interface UscisChartSelection {
  id: string;
  bulletin_month: string; // YYYY-MM
  preference_scope: PreferenceScope;
  chart_to_use: ChartType;
  source_url: string;
  source_published_at: string;
  created_at: string;
}

export interface PolicyUpdate {
  id: string;
  topic: string;
  subtopic: string | null;
  title: string;
  source_url: string;
  publisher: string;
  published_at: string;
  summary: string;
  why_it_matters: string;
  freshness_expires_at: string;
  source_type: SourceType;
  is_active: boolean;
  created_at: string;
}

export interface MilestoneRule {
  id: string;
  slug: string;
  title: string;
  applies_to_categories: Category[];
  applies_to_paths: PathType[];
  condition_expression: string;
  body_md: string;
  source_refs_json: Record<string, unknown>;
  last_validated_at: string | null;
  created_at: string;
}

export interface DerivedMonthlyMovement {
  id: string;
  category: Category;
  country_bucket: CountryBucket;
  chart_type: ChartType;
  bulletin_month: string; // YYYY-MM
  prior_bulletin_month: string; // YYYY-MM
  movement_days: number;
  movement_direction: MovementDirection;
  is_retrogression: boolean;
  is_no_change: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Tracker evaluation request / response
// ---------------------------------------------------------------------------

export interface TrackerEvaluationRequest {
  category: Category;
  country: CountryBucket;
  priorityDate: string; // ISO date YYYY-MM-DD
  path: PathType;
}

export interface CutoffStatus {
  state: "current" | "behind" | "ahead" | "unavailable";
  cutoff: string | null; // ISO date or null
  distanceDays: number | null;
  explanation: string;
}

export interface TrackerEvaluationResponse {
  scenario: {
    category: Category;
    country: CountryBucket;
    priorityDate: string;
    path: PathType;
  };
  currentBulletin: {
    month: string;
    publishedAt: string;
  };
  status: {
    finalAction: CutoffStatus;
    datesForFiling: CutoffStatus;
  };
  movement: {
    monthOverMonth: {
      finalActionDays: number;
      direction: MovementDirection;
    };
  };
  milestones: MilestoneCard[];
  sources: SourceReference[];
}

export interface MilestoneCard {
  slug: string;
  title: string;
  body: string;
  relevant: boolean;
}

export interface SourceReference {
  label: string;
  url: string;
  publishedAt: string;
}
