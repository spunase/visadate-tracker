"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Scale } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MovementChip } from "@/components/ui/movement-chip";
import { GLOBAL_DISCLAIMER } from "@/lib/content/disclaimers";
import { useBulletin, type CutoffRow } from "@/lib/hooks/use-bulletin";
import { usePreferencesStore, type PreferredCountry } from "@/stores/preferences-store";
import { CountryFlagSelector } from "@/components/ui/country-flag-selector";
import {
  formatBulletinMonth,
  formatCutoffDate,
} from "@/lib/utils/format-date";

// ─── Constants ───────────────────────────────────────────────

type CountryBucket = "india" | "china" | "all_other";
type ChartType = "final_action" | "dates_for_filing";

const COUNTRY_OPTIONS: { value: CountryBucket; label: string; displayCountry: PreferredCountry }[] = [
  { value: "india", label: "India", displayCountry: "India" },
  { value: "china", label: "China", displayCountry: "China" },
  { value: "all_other", label: "All Other", displayCountry: "All Other" },
];

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "final_action", label: "Final Action" },
  { value: "dates_for_filing", label: "Dates for Filing" },
];

// ─── Animation Variants ──────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

// ─── Helpers ─────────────────────────────────────────────────

function findRow(
  rows: CutoffRow[],
  category: string,
  country: CountryBucket,
  chartType: ChartType,
): CutoffRow | undefined {
  return rows.find(
    (r) =>
      r.category === category &&
      r.country_bucket === country &&
      r.chart_type === chartType,
  );
}

function daysBetween(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const cutoff = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - cutoff.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDistance(days: number | null): string {
  if (days === null) return "Current";
  if (days <= 0) return "Current";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0 && months > 0) return `~${years}y ${months}m behind`;
  if (years > 0) return `~${years}y behind`;
  if (months > 0) return `~${months}m behind`;
  return `${days}d behind`;
}

// ─── Loading Skeleton ────────────────────────────────────────

function ComparisonSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[1, 2].map((i) => (
        <Card
          key={i}
          className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm"
        >
          <CardContent className="p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-3 h-6 w-full" />
            <Skeleton className="mt-2 h-4 w-20" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Category Column ─────────────────────────────────────────

function CategoryColumn({
  label,
  row,
  className,
}: {
  label: string;
  row: CutoffRow | undefined;
  className?: string;
}) {
  const cutoffDate = row?.cutoff_date ?? null;
  const isCurrent = row?.cutoff_kind === "current" || !cutoffDate;
  const days = daysBetween(cutoffDate);
  const distance = formatDistance(days);

  return (
    <Card className={`rounded-[18px] border border-border/50 shadow-sm ${className ?? ""}`}>
      <CardContent className="flex flex-col items-center p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <div className="mt-3 rounded-xl bg-muted/60 px-4 py-2">
          <p className="text-lg font-bold tracking-tight text-foreground">
            {isCurrent ? "Current" : formatCutoffDate(cutoffDate)}
          </p>
        </div>

        <div className="mt-2.5">
          <MovementChip
            label={isCurrent ? "Current" : distance}
            direction={isCurrent ? "advanced" : "flat"}
          />
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          {isCurrent
            ? "No backlog"
            : `${days?.toLocaleString() ?? "-"} days from today`}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Page Component ──────────────────────────────────────────

const countryToBucket: Record<string, CountryBucket> = {
  India: "india",
  China: "china",
  Mexico: "all_other",
  Philippines: "all_other",
  "All Other": "all_other",
};

export default function ComparePage() {
  const { defaultCountry } = usePreferencesStore();
  const initBucket = countryToBucket[defaultCountry] ?? "india";

  const [country, setCountry] = useState<CountryBucket>(initBucket);
  const [compareDisplayCountry, setCompareDisplayCountry] = useState<PreferredCountry>(defaultCountry);
  const [chartType, setChartType] = useState<ChartType>("final_action");

  // Re-sync when store changes
  useEffect(() => {
    const bucket = countryToBucket[defaultCountry] ?? "india";
    setCountry(bucket);
    setCompareDisplayCountry(defaultCountry);
  }, [defaultCountry]);

  const {
    bulletin,
    cutoffRows,
    isLoading,
    error,
  } = useBulletin();

  const eb2Row = useMemo(
    () => findRow(cutoffRows, "EB2", country, chartType),
    [cutoffRows, country, chartType],
  );

  const eb3Row = useMemo(
    () => findRow(cutoffRows, "EB3", country, chartType),
    [cutoffRows, country, chartType],
  );

  const countryLabel = compareDisplayCountry;
  const chartLabel =
    CHART_OPTIONS.find((c) => c.value === chartType)?.label ?? "Final Action";

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="EB2 vs EB3"
        subtitle={`${countryLabel} \u2022 ${chartLabel}`}
        action={
          <Link
            href="/"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pb-8"
      >
        {/* Bulletin Month */}
        {bulletin && (
          <motion.div variants={item}>
            <p className="text-center text-xs text-muted-foreground">
              Visa Bulletin for{" "}
              <span className="font-semibold">
                {formatBulletinMonth(bulletin.bulletin_month)}
              </span>
            </p>
          </motion.div>
        )}

        {/* Country Selector */}
        <motion.div variants={item}>
          <div className="flex items-center justify-center">
            <CountryFlagSelector
              value={compareDisplayCountry}
              onChange={(c) => {
                setCompareDisplayCountry(c);
                setCountry(countryToBucket[c] ?? "all_other");
              }}
              label={null}
              ariaLabel="Select country for comparison"
            />
          </div>
        </motion.div>

        {/* Chart Type Toggle */}
        <motion.div variants={item}>
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-lg bg-muted p-[3px]">
              {CHART_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChartType(opt.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    chartType === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div variants={item}>
            <Card className="riso-doc-coral rounded-[18px] border border-red-200 bg-red-50 shadow-sm dark:border-red-900 dark:bg-red-950">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Comparison Columns */}
        <motion.div variants={item}>
          {isLoading ? (
            <ComparisonSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <CategoryColumn label="EB2" row={eb2Row} className="riso-doc-teal" />
              <CategoryColumn label="EB3" row={eb3Row} className="riso-doc-coral" />
            </div>
          )}
        </motion.div>

        {/* No Data State */}
        {!isLoading && !eb2Row && !eb3Row && !error && (
          <motion.div variants={item}>
            <p className="text-center text-sm text-muted-foreground">
              No cutoff data found for {countryLabel} under {chartLabel}.
            </p>
          </motion.div>
        )}

        {/* Recommendation Note */}
        <motion.div variants={item}>
          <Card className="riso-doc-gold-accent rounded-[18px] border border-[#2F6BFF]/15 bg-[#2F6BFF]/[0.03] shadow-sm dark:border-[#5B8CFF]/15 dark:bg-[#5B8CFF]/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                <Scale className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF] dark:text-[#5B8CFF]" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Understanding the tradeoff
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">EB2</span>{" "}
                    typically has a longer backlog for India and China, but
                    receives a larger share of visa numbers each year. Applicants
                    with advanced degrees or exceptional ability file here.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">EB3</span>{" "}
                    often has a shorter backlog, but fewer annual visa numbers
                    and a higher risk of retrogression. Skilled workers and
                    professionals with bachelor&apos;s degrees file here.
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Some applicants consider &quot;downgrading&quot; from EB2 to
                    EB3 (or vice versa) when the dates are significantly
                    different. This decision depends on individual circumstances
                    and should be discussed with an immigration attorney.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Note */}
        <motion.div variants={item}>
          <div className="riso-doc-gold-accent flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              &quot;Final Action Dates&quot; determine when USCIS can make a
              final decision. &quot;Dates for Filing&quot; indicate when you may
              submit your application. Check the USCIS website monthly to
              confirm which chart applies.
            </p>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={item}>
          <p className="riso-doc-gold-accent mt-2 rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            {GLOBAL_DISCLAIMER.text}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
