-- ============================================================================
-- VisaDateTracker — Initial Schema Migration
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Custom enum types
-- ---------------------------------------------------------------------------

CREATE TYPE validation_status AS ENUM ('draft', 'validated', 'published', 'superseded');
CREATE TYPE chart_type        AS ENUM ('final_action', 'dates_for_filing');
CREATE TYPE category          AS ENUM ('EB1', 'EB2', 'EB3', 'Other_Workers');
CREATE TYPE country_bucket    AS ENUM ('india', 'china_mainland', 'mexico', 'philippines', 'all_other');
CREATE TYPE cutoff_kind       AS ENUM ('date', 'current', 'unavailable');
CREATE TYPE movement_direction AS ENUM ('forward', 'backward', 'unchanged');
CREATE TYPE source_type       AS ENUM ('official', 'secondary');
CREATE TYPE preference_scope  AS ENUM ('employment_based');
CREATE TYPE path_type         AS ENUM ('AOS', 'CP');

-- ---------------------------------------------------------------------------
-- 1. visa_bulletins
-- ---------------------------------------------------------------------------

CREATE TABLE visa_bulletins (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulletin_month      TEXT NOT NULL,                          -- YYYY-MM
  source_url          TEXT NOT NULL,
  source_published_at TIMESTAMPTZ NOT NULL,
  raw_snapshot_path   TEXT,
  validation_status   validation_status NOT NULL DEFAULT 'draft',
  validated_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bulletin_month_format CHECK (bulletin_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT unique_bulletin_month UNIQUE (bulletin_month)
);

CREATE INDEX idx_visa_bulletins_month ON visa_bulletins (bulletin_month DESC);
CREATE INDEX idx_visa_bulletins_status ON visa_bulletins (validation_status);

-- ---------------------------------------------------------------------------
-- 2. visa_cutoff_rows
-- ---------------------------------------------------------------------------

CREATE TABLE visa_cutoff_rows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulletin_id     UUID NOT NULL REFERENCES visa_bulletins(id) ON DELETE CASCADE,
  chart_type      chart_type NOT NULL,
  category        category NOT NULL,
  country_bucket  country_bucket NOT NULL,
  cutoff_kind     cutoff_kind NOT NULL,
  cutoff_date     DATE,                                       -- NULL when kind is 'current' or 'unavailable'
  original_value  TEXT NOT NULL,                               -- raw string from source (e.g. "01SEP12", "C", "U")
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT cutoff_date_required_when_date CHECK (
    (cutoff_kind = 'date' AND cutoff_date IS NOT NULL) OR
    (cutoff_kind != 'date' AND cutoff_date IS NULL)
  ),
  CONSTRAINT unique_cutoff_row UNIQUE (bulletin_id, chart_type, category, country_bucket)
);

CREATE INDEX idx_cutoff_rows_bulletin ON visa_cutoff_rows (bulletin_id);
CREATE INDEX idx_cutoff_rows_lookup ON visa_cutoff_rows (chart_type, category, country_bucket);

-- ---------------------------------------------------------------------------
-- 3. uscis_chart_selection
-- ---------------------------------------------------------------------------

CREATE TABLE uscis_chart_selection (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulletin_month      TEXT NOT NULL,
  preference_scope    preference_scope NOT NULL DEFAULT 'employment_based',
  chart_to_use        chart_type NOT NULL,
  source_url          TEXT NOT NULL,
  source_published_at TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chart_sel_month_format CHECK (bulletin_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT unique_chart_selection UNIQUE (bulletin_month, preference_scope)
);

CREATE INDEX idx_chart_selection_month ON uscis_chart_selection (bulletin_month DESC);

-- ---------------------------------------------------------------------------
-- 4. policy_updates
-- ---------------------------------------------------------------------------

CREATE TABLE policy_updates (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic                TEXT NOT NULL,
  subtopic             TEXT,
  title                TEXT NOT NULL,
  source_url           TEXT NOT NULL,
  publisher            TEXT NOT NULL,
  published_at         TIMESTAMPTZ NOT NULL,
  summary              TEXT NOT NULL,
  why_it_matters       TEXT NOT NULL,
  freshness_expires_at TIMESTAMPTZ NOT NULL,
  source_type          source_type NOT NULL DEFAULT 'official',
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_updates_active ON policy_updates (is_active, published_at DESC);
CREATE INDEX idx_policy_updates_topic ON policy_updates (topic);

-- ---------------------------------------------------------------------------
-- 5. milestone_rules
-- ---------------------------------------------------------------------------

CREATE TABLE milestone_rules (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                    TEXT NOT NULL UNIQUE,
  title                   TEXT NOT NULL,
  applies_to_categories   category[] NOT NULL DEFAULT '{}',
  applies_to_paths        path_type[] NOT NULL DEFAULT '{}',
  condition_expression    TEXT NOT NULL,              -- e.g. "distanceDays > -365"
  body_md                 TEXT NOT NULL,
  source_refs_json        JSONB NOT NULL DEFAULT '{}',
  last_validated_at       TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestone_rules_slug ON milestone_rules (slug);

-- ---------------------------------------------------------------------------
-- 6. derived_monthly_movements
-- ---------------------------------------------------------------------------

CREATE TABLE derived_monthly_movements (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category             category NOT NULL,
  country_bucket       country_bucket NOT NULL,
  chart_type           chart_type NOT NULL,
  bulletin_month       TEXT NOT NULL,
  prior_bulletin_month TEXT NOT NULL,
  movement_days        INTEGER NOT NULL,
  movement_direction   movement_direction NOT NULL,
  is_retrogression     BOOLEAN NOT NULL DEFAULT false,
  is_no_change         BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT movement_month_format CHECK (bulletin_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT prior_month_format CHECK (prior_bulletin_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT unique_movement UNIQUE (category, country_bucket, chart_type, bulletin_month)
);

CREATE INDEX idx_movements_lookup ON derived_monthly_movements (category, country_bucket, chart_type, bulletin_month DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE visa_bulletins           ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_cutoff_rows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE uscis_chart_selection    ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_updates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_rules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE derived_monthly_movements ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anon & authenticated roles)
-- These are reference data tables — all users can read, only service_role can write.

CREATE POLICY "Allow public read on visa_bulletins"
  ON visa_bulletins FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on visa_cutoff_rows"
  ON visa_cutoff_rows FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on uscis_chart_selection"
  ON uscis_chart_selection FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on policy_updates"
  ON policy_updates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow public read on milestone_rules"
  ON milestone_rules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on derived_monthly_movements"
  ON derived_monthly_movements FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service-role write access (INSERT, UPDATE, DELETE) for all tables

CREATE POLICY "Allow service_role write on visa_bulletins"
  ON visa_bulletins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role write on visa_cutoff_rows"
  ON visa_cutoff_rows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role write on uscis_chart_selection"
  ON uscis_chart_selection FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role write on policy_updates"
  ON policy_updates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role write on milestone_rules"
  ON milestone_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service_role write on derived_monthly_movements"
  ON derived_monthly_movements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
