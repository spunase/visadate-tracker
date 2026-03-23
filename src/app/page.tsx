"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MovementChip } from "@/components/ui/movement-chip";
import { FreshnessIndicator } from "@/components/ui/freshness-indicator";
import { SourceBadge } from "@/components/ui/source-badge";
import { GLOBAL_DISCLAIMER } from "@/lib/content/disclaimers";
import { useBulletin, type CutoffRow } from "@/lib/hooks/use-bulletin";
import { useNews } from "@/lib/hooks/use-news";
import {
  formatBulletinMonth,
  formatCutoffDate,
  formatRelativeDate,
} from "@/lib/utils/format-date";

// ─── Animation Variants ───────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────

const INDIA_EB_CATEGORIES = ["EB1", "EB2", "EB3"];

function filterIndiaFinalAction(rows: CutoffRow[]) {
  return rows.filter(
    (r) =>
      r.chart_type === "final_action" &&
      r.country_bucket === "india" &&
      INDIA_EB_CATEGORIES.includes(r.category),
  );
}

function generateNarrative(rows: CutoffRow[]): string {
  const indiaRows = filterIndiaFinalAction(rows);
  if (indiaRows.length === 0) {
    return "No cutoff data available for the current bulletin. Check back when the new bulletin is published.";
  }

  const parts = indiaRows.map((row) => {
    const date = formatCutoffDate(row.cutoff_date);
    if (row.cutoff_kind === "current") {
      return `${row.category} India is now current`;
    }
    return `${row.category} India has a Final Action Date of ${date}`;
  });

  return (
    parts.join(". ") +
    ". Filing dates should be verified with the official bulletin for consular processing applicants."
  );
}

// ─── Loading Skeletons ────────────────────────────────────────

function HeroSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[18px] border-0 bg-gradient-to-br from-[#2F6BFF] to-[#1B4FCC] text-white shadow-lg">
      <CardContent className="p-5">
        <Skeleton className="h-4 w-28 bg-white/20" />
        <Skeleton className="mt-2 h-7 w-40 bg-white/20" />
        <Skeleton className="mt-3 h-4 w-full bg-white/20" />
      </CardContent>
    </Card>
  );
}

function MovementSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="rounded-[18px] border border-border/50 shadow-sm"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="rounded-[18px] border border-border/50 shadow-sm"
        >
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1.5 h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <Card className="rounded-[18px] border border-red-200 bg-red-50 shadow-sm dark:border-red-900 dark:bg-red-950">
      <CardContent className="flex items-center gap-3 p-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Unable to load latest data
          </p>
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
            {message}. Showing last available data if possible.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page Component ───────────────────────────────────────────

export default function HomePage() {
  const {
    bulletin,
    cutoffRows,
    isLoading: bulletinLoading,
    error: bulletinError,
  } = useBulletin();

  const {
    news,
    isLoading: newsLoading,
    error: newsError,
  } = useNews();

  const indiaFinalAction = useMemo(
    () => filterIndiaFinalAction(cutoffRows),
    [cutoffRows],
  );

  const narrative = useMemo(
    () => generateNarrative(cutoffRows),
    [cutoffRows],
  );

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="VisaDateTracker"
        subtitle="Your green card priority date companion"
        action={
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pb-8"
      >
        {/* Error Banners */}
        {bulletinError && (
          <motion.div variants={item}>
            <ErrorBanner message={bulletinError} />
          </motion.div>
        )}
        {newsError && !bulletinError && (
          <motion.div variants={item}>
            <ErrorBanner message={newsError} />
          </motion.div>
        )}

        {/* Hero / Bulletin Month */}
        <motion.div variants={item}>
          {bulletinLoading ? (
            <HeroSkeleton />
          ) : (
            <Card className="overflow-hidden rounded-[18px] border-0 bg-gradient-to-br from-[#2F6BFF] to-[#1B4FCC] text-white shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white/70">
                    Current Bulletin
                  </p>
                  {bulletin?.source_published_at && (
                    <FreshnessIndicator
                      updatedAt={new Date(bulletin.source_published_at)}
                      staleAfterDays={35}
                      freshWithinDays={3}
                      className="text-white/70"
                    />
                  )}
                </div>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  {bulletin
                    ? formatBulletinMonth(bulletin.bulletin_month)
                    : "No Data"}
                </h2>
                <p className="mt-2 text-sm text-white/80">
                  Visa Bulletin for employment-based preferences. Data below
                  reflects Final Action Dates.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Movement Summary Cards */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Key Movements
          </h3>
          {bulletinLoading ? (
            <MovementSkeleton />
          ) : (
            <div className="flex flex-col gap-3">
              {indiaFinalAction.map((row) => {
                const movementLabel =
                  row.cutoff_kind === "current"
                    ? "Current"
                    : formatCutoffDate(row.cutoff_date);

                return (
                  <Card
                    key={`${row.category}-${row.country_bucket}`}
                    className="rounded-[18px] border border-border/50 shadow-sm"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {row.category} India
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Final Action: {formatCutoffDate(row.cutoff_date)}
                        </p>
                      </div>
                      <MovementChip
                        label={movementLabel}
                        direction={
                          row.cutoff_kind === "current" ? "advanced" : "flat"
                        }
                      />
                    </CardContent>
                  </Card>
                );
              })}
              {indiaFinalAction.length === 0 && !bulletinError && (
                <p className="text-sm text-muted-foreground">
                  No movement data available for India EB categories.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* What Changed This Month */}
        <motion.div variants={item}>
          {bulletinLoading ? (
            <Card className="rounded-[18px] border border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  What Changed This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[18px] border border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  What Changed This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{narrative}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Top News Preview */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top News
          </h3>
          {newsLoading ? (
            <NewsSkeleton />
          ) : (
            <div className="flex flex-col gap-3">
              {news.map((article) => (
                <Card
                  key={article.id}
                  className="rounded-[18px] border border-border/50 shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <SourceBadge
                        source={
                          article.source_type === "official"
                            ? "official"
                            : "derived"
                        }
                        label={article.publisher}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeDate(article.published_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                      {article.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {article.summary}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {news.length === 0 && !newsError && (
                <p className="text-sm text-muted-foreground">
                  No recent news available.
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={item}>
          <p className="mt-2 rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            {GLOBAL_DISCLAIMER.text}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
