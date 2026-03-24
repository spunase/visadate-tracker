-- ============================================================================
-- VisaDateTracker — Seed Data
-- 12 months of realistic employment-based visa bulletin data (2025-04 to 2026-03)
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. visa_bulletins  (12 rows, one per month)
-- ---------------------------------------------------------------------------

INSERT INTO visa_bulletins (id, bulletin_month, source_url, source_published_at, validation_status, validated_at)
VALUES
  (gen_random_uuid(), '2025-04', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-april-2025.html',       '2025-03-12T16:00:00Z', 'published', '2025-03-13T10:00:00Z'),
  (gen_random_uuid(), '2025-05', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-may-2025.html',         '2025-04-10T16:00:00Z', 'published', '2025-04-11T10:00:00Z'),
  (gen_random_uuid(), '2025-06', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-june-2025.html',        '2025-05-14T16:00:00Z', 'published', '2025-05-15T10:00:00Z'),
  (gen_random_uuid(), '2025-07', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-july-2025.html',        '2025-06-11T16:00:00Z', 'published', '2025-06-12T10:00:00Z'),
  (gen_random_uuid(), '2025-08', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-august-2025.html',      '2025-07-09T16:00:00Z', 'published', '2025-07-10T10:00:00Z'),
  (gen_random_uuid(), '2025-09', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-september-2025.html',   '2025-08-13T16:00:00Z', 'published', '2025-08-14T10:00:00Z'),
  (gen_random_uuid(), '2025-10', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-october-2025.html',     '2025-09-10T16:00:00Z', 'published', '2025-09-11T10:00:00Z'),
  (gen_random_uuid(), '2025-11', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-november-2025.html',    '2025-10-15T16:00:00Z', 'published', '2025-10-16T10:00:00Z'),
  (gen_random_uuid(), '2025-12', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-december-2025.html',    '2025-11-12T16:00:00Z', 'published', '2025-11-13T10:00:00Z'),
  (gen_random_uuid(), '2026-01', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-january-2026.html',     '2025-12-10T16:00:00Z', 'published', '2025-12-11T10:00:00Z'),
  (gen_random_uuid(), '2026-02', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-february-2026.html',    '2026-01-14T16:00:00Z', 'published', '2026-01-15T10:00:00Z'),
  (gen_random_uuid(), '2026-03', 'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-march-2026.html',       '2026-02-11T16:00:00Z', 'published', '2026-02-12T10:00:00Z');


-- ---------------------------------------------------------------------------
-- 2. visa_cutoff_rows  (18 rows per bulletin x 12 bulletins = 216 rows)
--
-- For each bulletin: Final Action + Dates for Filing
--   x EB1, EB2, EB3
--   x india, china_mainland, all_other
--
-- Realistic date progressions:
--   EB2 India FA:  2012-02-01 -> retrogress Nov 2025 -> recover -> 2012-09-01
--   EB3 India FA:  2011-09-01 -> slow -> 2012-06-08
--   EB1 India FA:  2020-01-01 -> faster -> 2022-02-01
--   China:         similar but offset
--   all_other:     mostly 'current'
--   DFF:           more advanced than FA
-- ---------------------------------------------------------------------------

-- Helper: insert all 18 cutoff rows for a given bulletin_month
-- We use a CTE to look up the bulletin_id by month.

-- ==================== 2025-04 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-04')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  -- Final Action
  ('final_action', 'EB1', 'india',          'date', '2020-01-01', '01JAN20'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2022-06-01', '01JUN22'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-02-01', '01FEB12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-03-01', '01MAR20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2011-09-01', '01SEP11'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2019-06-01', '01JUN19'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  -- Dates for Filing
  ('dates_for_filing', 'EB1', 'india',          'date', '2021-06-01', '01JUN21'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-01-01', '01JAN23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-01-01', '01JAN13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-01-01', '01JAN21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-06-01', '01JUN12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-03-01', '01MAR20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-05 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-05')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2020-03-01', '01MAR20'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2022-08-01', '01AUG22'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-03-01', '01MAR12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-05-01', '01MAY20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2011-10-01', '01OCT11'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2019-08-01', '01AUG19'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2021-08-01', '01AUG21'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-03-01', '01MAR23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-02-01', '01FEB13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-03-01', '01MAR21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-07-01', '01JUL12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-05-01', '01MAY20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-06 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-06')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2020-06-01', '01JUN20'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2022-10-01', '01OCT22'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-04-15', '15APR12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-07-01', '01JUL20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2011-11-01', '01NOV11'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2019-09-15', '15SEP19'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2021-10-01', '01OCT21'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-05-01', '01MAY23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-03-15', '15MAR13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-05-01', '01MAY21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-08-01', '01AUG12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-06-15', '15JUN20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-07 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-07')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2020-09-01', '01SEP20'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2022-12-01', '01DEC22'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-04-15', '15APR12'),  -- flat month
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-08-15', '15AUG20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2011-12-01', '01DEC11'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2019-11-01', '01NOV19'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2021-12-01', '01DEC21'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-07-01', '01JUL23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-04-01', '01APR13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-06-01', '01JUN21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-09-01', '01SEP12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-08-01', '01AUG20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-08 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-08')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2020-11-15', '15NOV20'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-02-01', '01FEB23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-06-01', '01JUN12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-10-01', '01OCT20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-01-01', '01JAN12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2019-12-15', '15DEC19'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-02-01', '01FEB22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-09-01', '01SEP23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-05-01', '01MAY13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-08-01', '01AUG21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-10-01', '01OCT12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-09-15', '15SEP20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-09 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-09')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2021-01-15', '15JAN21'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-04-01', '01APR23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-07-01', '01JUL12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2020-12-01', '01DEC20'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-01-01', '01JAN12'),  -- flat month
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-02-01', '01FEB20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-04-01', '01APR22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2023-11-01', '01NOV23'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-06-01', '01JUN13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-10-01', '01OCT21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-10-15', '15OCT12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2020-11-01', '01NOV20'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-10 (new fiscal year) ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-10')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2021-04-01', '01APR21'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-06-01', '01JUN23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-08-01', '01AUG12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-01-15', '15JAN21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-02-01', '01FEB12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-04-01', '01APR20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-06-01', '01JUN22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-01-01', '01JAN24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-07-01', '01JUL13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2021-11-15', '15NOV21'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2012-11-15', '15NOV12'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-01-01', '01JAN21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-11 (retrogression month for EB2 India) ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-11')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2021-06-01', '01JUN21'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-07-15', '15JUL23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-06-01', '01JUN12'),  -- RETROGRESSION: back from Aug to Jun (-61 days)
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-02-01', '01FEB21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-03-15', '15MAR12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-05-15', '15MAY20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-08-01', '01AUG22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-03-01', '01MAR24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-07-01', '01JUL13'),  -- DFF unchanged
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2022-01-01', '01JAN22'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2013-01-01', '01JAN13'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-02-15', '15FEB21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2025-12 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2025-12')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2021-08-01', '01AUG21'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-09-01', '01SEP23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-07-01', '01JUL12'),  -- recovering from retrogression
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-04-01', '01APR21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-04-01', '01APR12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-07-01', '01JUL20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-10-01', '01OCT22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-04-15', '15APR24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-08-01', '01AUG13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2022-03-01', '01MAR22'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2013-02-01', '01FEB13'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-04-01', '01APR21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2026-01 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2026-01')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2021-10-15', '15OCT21'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2023-11-01', '01NOV23'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-07-01', '01JUL12'),  -- flat month
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-06-01', '01JUN21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-05-01', '01MAY12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-08-15', '15AUG20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2022-12-01', '01DEC22'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-06-01', '01JUN24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-09-01', '01SEP13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2022-05-01', '01MAY22'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2013-03-01', '01MAR13'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-05-15', '15MAY21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2026-02 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2026-02')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2022-01-01', '01JAN22'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2024-01-01', '01JAN24'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-08-15', '15AUG12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-08-01', '01AUG21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-05-15', '15MAY12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-10-01', '01OCT20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2023-02-01', '01FEB23'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-08-01', '01AUG24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-10-01', '01OCT13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2022-07-01', '01JUL22'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2013-04-01', '01APR13'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-07-01', '01JUL21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);

-- ==================== 2026-03 ====================
WITH b AS (SELECT id FROM visa_bulletins WHERE bulletin_month = '2026-03')
INSERT INTO visa_cutoff_rows (id, bulletin_id, chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value)
SELECT gen_random_uuid(), b.id, v.chart_type::chart_type, v.category::category, v.country_bucket::country_bucket, v.cutoff_kind::cutoff_kind, v.cutoff_date::date, v.original_value
FROM b, (VALUES
  ('final_action', 'EB1', 'india',          'date', '2022-02-01', '01FEB22'),
  ('final_action', 'EB1', 'china_mainland',  'date', '2024-03-01', '01MAR24'),
  ('final_action', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB2', 'india',          'date', '2012-09-01', '01SEP12'),
  ('final_action', 'EB2', 'china_mainland',  'date', '2021-10-01', '01OCT21'),
  ('final_action', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('final_action', 'EB3', 'india',          'date', '2012-06-08', '08JUN12'),
  ('final_action', 'EB3', 'china_mainland',  'date', '2020-12-01', '01DEC20'),
  ('final_action', 'EB3', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB1', 'india',          'date', '2023-04-01', '01APR23'),
  ('dates_for_filing', 'EB1', 'china_mainland',  'date', '2024-10-01', '01OCT24'),
  ('dates_for_filing', 'EB1', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB2', 'india',          'date', '2013-11-01', '01NOV13'),
  ('dates_for_filing', 'EB2', 'china_mainland',  'date', '2022-09-01', '01SEP22'),
  ('dates_for_filing', 'EB2', 'all_other',       'current', NULL,      'C'),
  ('dates_for_filing', 'EB3', 'india',          'date', '2013-05-01', '01MAY13'),
  ('dates_for_filing', 'EB3', 'china_mainland',  'date', '2021-09-01', '01SEP21'),
  ('dates_for_filing', 'EB3', 'all_other',       'current', NULL,      'C')
) AS v(chart_type, category, country_bucket, cutoff_kind, cutoff_date, original_value);


-- ---------------------------------------------------------------------------
-- 3. uscis_chart_selection  (12 rows)
--    Most months use final_action; a few use dates_for_filing
-- ---------------------------------------------------------------------------

INSERT INTO uscis_chart_selection (id, bulletin_month, preference_scope, chart_to_use, source_url, source_published_at)
VALUES
  (gen_random_uuid(), '2025-04', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-04', '2025-03-20T18:00:00Z'),
  (gen_random_uuid(), '2025-05', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-05', '2025-04-18T18:00:00Z'),
  (gen_random_uuid(), '2025-06', 'employment_based', 'dates_for_filing', 'https://www.uscis.gov/visabulletininfo/2025-06', '2025-05-22T18:00:00Z'),
  (gen_random_uuid(), '2025-07', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-07', '2025-06-19T18:00:00Z'),
  (gen_random_uuid(), '2025-08', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-08', '2025-07-17T18:00:00Z'),
  (gen_random_uuid(), '2025-09', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-09', '2025-08-21T18:00:00Z'),
  (gen_random_uuid(), '2025-10', 'employment_based', 'dates_for_filing', 'https://www.uscis.gov/visabulletininfo/2025-10', '2025-09-18T18:00:00Z'),
  (gen_random_uuid(), '2025-11', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-11', '2025-10-23T18:00:00Z'),
  (gen_random_uuid(), '2025-12', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2025-12', '2025-11-20T18:00:00Z'),
  (gen_random_uuid(), '2026-01', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2026-01', '2025-12-18T18:00:00Z'),
  (gen_random_uuid(), '2026-02', 'employment_based', 'dates_for_filing', 'https://www.uscis.gov/visabulletininfo/2026-02', '2026-01-22T18:00:00Z'),
  (gen_random_uuid(), '2026-03', 'employment_based', 'final_action',     'https://www.uscis.gov/visabulletininfo/2026-03', '2026-02-19T18:00:00Z');


-- ---------------------------------------------------------------------------
-- 4. policy_updates  (4 realistic news items)
-- ---------------------------------------------------------------------------

INSERT INTO policy_updates (id, topic, subtopic, title, source_url, publisher, published_at, summary, why_it_matters, freshness_expires_at, source_type, is_active)
VALUES
  (
    gen_random_uuid(),
    'H-1B',
    'Registration',
    'USCIS Announces FY2026 H-1B Registration Period: March 7-24, 2025',
    'https://www.uscis.gov/newsroom/alerts/fy2026-h1b-cap-registration',
    'USCIS',
    '2025-02-28T14:00:00Z',
    'USCIS has confirmed the FY2026 H-1B electronic registration period will run from March 7 through March 24, 2025. The registration fee remains $215 per beneficiary. USCIS expects to receive approximately 470,000 registrations for the 85,000 available cap slots.',
    'H-1B registration is the first step for employer-sponsored workers. Those selected in the lottery can file H-1B petitions starting April 1, 2025. Workers on EB-2/EB-3 tracks often hold H-1B status while waiting for green card priority dates to become current.',
    '2025-06-30T00:00:00Z',
    'official',
    true
  ),
  (
    gen_random_uuid(),
    'Employment-Based Green Card',
    'EB-2 India',
    'EB-2 India Final Action Date Retrogresses Two Months in November 2025 Visa Bulletin',
    'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2025/visa-bulletin-for-november-2025.html',
    'Department of State',
    '2025-10-15T16:00:00Z',
    'The November 2025 Visa Bulletin shows EB-2 India Final Action Date moving backward from August 1, 2012 to June 1, 2012 — a retrogression of approximately 61 days. This follows months of steady forward movement. The Department of State cited higher-than-expected demand in the category.',
    'EB-2 India retrogression directly impacts thousands of Indian nationals awaiting adjustment of status. Those with priority dates between June and August 2012 who were previously eligible to file I-485 may see their applications delayed. This retrogression is expected to be temporary as the new fiscal year visa numbers are allocated.',
    '2026-02-15T00:00:00Z',
    'official',
    true
  ),
  (
    gen_random_uuid(),
    'Legislation',
    'Per-Country Cap',
    'EAGLE Act Reintroduced in 119th Congress to Eliminate Per-Country Green Card Caps',
    'https://www.congress.gov/bill/119th-congress/house-bill/eagle-act',
    'U.S. Congress',
    '2025-04-10T12:00:00Z',
    'Representatives have reintroduced the EAGLE Act (Equal Access to Green cards for Legal Employment) in the 119th Congress. The bill would phase out the 7% per-country cap on employment-based green cards over a 9-year transition period, primarily benefiting applicants from India and China who face decades-long backlogs.',
    'If enacted, the EAGLE Act would dramatically reduce EB-2 and EB-3 India wait times from potentially 50+ years to under 10 years. However, similar bills have been introduced in previous sessions without becoming law. The transition period would temporarily affect applicants from non-backlogged countries.',
    '2026-12-31T00:00:00Z',
    'secondary',
    true
  ),
  (
    gen_random_uuid(),
    'USCIS Processing',
    'I-485 Processing Times',
    'USCIS Reports Reduced I-485 Processing Times for Employment-Based Categories',
    'https://egov.uscis.gov/processing-times/',
    'USCIS',
    '2025-08-05T10:00:00Z',
    'USCIS has updated processing times for Form I-485 (Adjustment of Status) at major service centers. The Nebraska Service Center reports median processing time of 8.5 months for employment-based I-485 applications, down from 12 months in FY2024. The National Benefits Center shows similar improvements at 9 months median.',
    'Faster I-485 processing means that once a priority date becomes current, applicants can expect to receive their green cards sooner. Combined with the Final Action Date movements tracked in this tool, users can better estimate their total timeline from priority date currency to green card approval.',
    '2026-02-05T00:00:00Z',
    'official',
    true
  );


-- ---------------------------------------------------------------------------
-- 5. derived_monthly_movements
--    For EB2 India and EB3 India (final_action) between consecutive bulletins
--
--    EB2 India FA progression:
--    2025-04: 2012-02-01
--    2025-05: 2012-03-01  (+28 days, forward)
--    2025-06: 2012-04-15  (+45 days, forward)
--    2025-07: 2012-04-15  (0 days, unchanged)
--    2025-08: 2012-06-01  (+47 days, forward)
--    2025-09: 2012-07-01  (+30 days, forward)
--    2025-10: 2012-08-01  (+31 days, forward)
--    2025-11: 2012-06-01  (-61 days, backward, RETROGRESSION)
--    2025-12: 2012-07-01  (+30 days, forward)
--    2026-01: 2012-07-01  (0 days, unchanged)
--    2026-02: 2012-08-15  (+45 days, forward)
--    2026-03: 2012-09-01  (+17 days, forward)
--
--    EB3 India FA progression:
--    2025-04: 2011-09-01
--    2025-05: 2011-10-01  (+30 days, forward)
--    2025-06: 2011-11-01  (+31 days, forward)
--    2025-07: 2011-12-01  (+30 days, forward)
--    2025-08: 2012-01-01  (+31 days, forward)
--    2025-09: 2012-01-01  (0 days, unchanged)
--    2025-10: 2012-02-01  (+31 days, forward)
--    2025-11: 2012-03-15  (+43 days, forward)
--    2025-12: 2012-04-01  (+17 days, forward)
--    2026-01: 2012-05-01  (+30 days, forward)
--    2026-02: 2012-05-15  (+14 days, forward)
--    2026-03: 2012-06-08  (+24 days, forward)
-- ---------------------------------------------------------------------------

INSERT INTO derived_monthly_movements (id, category, country_bucket, chart_type, bulletin_month, prior_bulletin_month, movement_days, movement_direction, is_retrogression, is_no_change)
VALUES
  -- EB2 India Final Action movements
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-05', '2025-04',  28,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-06', '2025-05',  45,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-07', '2025-06',   0,  'unchanged', false, true),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-08', '2025-07',  47,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-09', '2025-08',  30,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-10', '2025-09',  31,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-11', '2025-10', -61,  'backward',  true,  false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2025-12', '2025-11',  30,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2026-01', '2025-12',   0,  'unchanged', false, true),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2026-02', '2026-01',  45,  'forward',   false, false),
  (gen_random_uuid(), 'EB2', 'india', 'final_action', '2026-03', '2026-02',  17,  'forward',   false, false),

  -- EB3 India Final Action movements
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-05', '2025-04',  30,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-06', '2025-05',  31,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-07', '2025-06',  30,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-08', '2025-07',  31,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-09', '2025-08',   0,  'unchanged', false, true),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-10', '2025-09',  31,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-11', '2025-10',  43,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2025-12', '2025-11',  17,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2026-01', '2025-12',  30,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2026-02', '2026-01',  14,  'forward',   false, false),
  (gen_random_uuid(), 'EB3', 'india', 'final_action', '2026-03', '2026-02',  24,  'forward',   false, false);


COMMIT;
