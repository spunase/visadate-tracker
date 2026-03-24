"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { VelocityArc } from "@/components/ui/velocity-arc";
import { HopeContext } from "@/components/ui/hope-context";
import { ShimmerReveal } from "@/components/ui/shimmer-reveal";
import { JourneySnapshot } from "@/components/ui/journey-snapshot";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  usePreferencesStore,
  COUNTRIES_BY_QUEUE,
  CATEGORIES,
  type PreferredCountry,
  type PreferredCategory,
} from "@/stores/preferences-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Direction = "forward" | "backward" | "none";
type CutoffValue =
  | { kind: "date"; value: string }
  | { kind: "current" }
  | { kind: "unavailable" };

interface MovementRow {
  category: PreferredCategory;
  country: PreferredCountry;
  finalAction: CutoffValue;
  filingDate: CutoffValue;
  movement: string;
  direction: Direction;
}

// ---------------------------------------------------------------------------
// Full dataset (March 2026 Visa Bulletin — official DOS source)
// ---------------------------------------------------------------------------

const allMovementData: MovementRow[] = [
  // India
  { category: "EB1", country: "India", finalAction: { kind: "date", value: "Mar 01, 2023" }, filingDate: { kind: "date", value: "Dec 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "EB2", country: "India", finalAction: { kind: "date", value: "Sep 15, 2013" }, filingDate: { kind: "date", value: "Nov 01, 2014" }, movement: "+2 months", direction: "forward" },
  { category: "EB3", country: "India", finalAction: { kind: "date", value: "Nov 15, 2013" }, filingDate: { kind: "date", value: "Aug 15, 2014" }, movement: "No change", direction: "none" },
  // China
  { category: "EB1", country: "China", finalAction: { kind: "date", value: "Feb 22, 2023" }, filingDate: { kind: "date", value: "Oct 01, 2023" }, movement: "+3 weeks", direction: "forward" },
  { category: "EB2", country: "China", finalAction: { kind: "date", value: "Apr 08, 2021" }, filingDate: { kind: "date", value: "Aug 01, 2021" }, movement: "+1 month", direction: "forward" },
  { category: "EB3", country: "China", finalAction: { kind: "date", value: "Sep 01, 2020" }, filingDate: { kind: "date", value: "Jan 01, 2021" }, movement: "+2 weeks", direction: "forward" },
  // Philippines
  { category: "EB1", country: "Philippines", finalAction: { kind: "current" }, filingDate: { kind: "current" }, movement: "Current", direction: "none" },
  { category: "EB2", country: "Philippines", finalAction: { kind: "current" }, filingDate: { kind: "current" }, movement: "Current", direction: "none" },
  { category: "EB3", country: "Philippines", finalAction: { kind: "date", value: "Nov 22, 2021" }, filingDate: { kind: "date", value: "Sep 01, 2022" }, movement: "+3 weeks", direction: "forward" },
  // Mexico
  { category: "EB1", country: "Mexico", finalAction: { kind: "current" }, filingDate: { kind: "current" }, movement: "Current", direction: "none" },
  { category: "EB2", country: "Mexico", finalAction: { kind: "current" }, filingDate: { kind: "current" }, movement: "Current", direction: "none" },
  { category: "EB3", country: "Mexico", finalAction: { kind: "date", value: "Dec 01, 2021" }, filingDate: { kind: "date", value: "Apr 01, 2023" }, movement: "No change", direction: "none" },
  // All Other
  { category: "EB1", country: "All Other", finalAction: { kind: "current" }, filingDate: { kind: "current" }, movement: "Current", direction: "none" },
  { category: "EB2", country: "All Other", finalAction: { kind: "date", value: "Oct 15, 2024" }, filingDate: { kind: "current" }, movement: "+2 weeks", direction: "forward" },
  { category: "EB3", country: "All Other", finalAction: { kind: "date", value: "Jan 08, 2023" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
];

const newsPreview = [
  { id: "1", badge: "USCIS", headline: "March 2026 Visa Bulletin Released", summary: "Department of State publishes updated priority dates for employment-based categories.", date: "Mar 10, 2026" },
  { id: "2", badge: "H-1B", headline: "FY2027 H-1B Registration Opens April 1", summary: "USCIS announces electronic registration period for H-1B cap-subject petitions.", date: "Mar 8, 2026" },
  { id: "3", badge: "Policy", headline: "USCIS Updates Filing Date Policy", summary: "New guidance on when Filing Date chart can be used for AOS applications.", date: "Mar 5, 2026" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCutoffValue(value: CutoffValue): string {
  if (value.kind === "current") return "Current";
  if (value.kind === "unavailable") return "Unavailable";
  return value.value;
}

function cutoffValueClasses(value: CutoffValue): string {
  if (value.kind === "current") return "text-emerald-700 dark:text-emerald-300";
  if (value.kind === "unavailable") return "text-muted-foreground";
  return "text-foreground";
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

// ---------------------------------------------------------------------------
// Movement Card component
// ---------------------------------------------------------------------------

function MovementCard({ row }: { row: MovementRow }) {
  return (
    <Card className="rounded-[18px] border border-border/50 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {row.category} {row.country}
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Final Action
              </span>
              <span className={`truncate text-xs font-medium ${cutoffValueClasses(row.finalAction)}`}>
                {formatCutoffValue(row.finalAction)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex rounded-md bg-status-filing px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-status-filing-foreground">
                Filing Date
              </span>
              <span className={`truncate text-xs font-medium ${cutoffValueClasses(row.filingDate)}`}>
                {formatCutoffValue(row.filingDate)}
              </span>
            </div>
          </div>
        </div>
        <VelocityArc direction={row.direction} movement={row.movement} size="sm" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  const { defaultCountry, defaultCategory } = usePreferencesStore();

  // Local filter state (initialized from preferences)
  const [selectedCountry, setSelectedCountry] = useState<PreferredCountry>(defaultCountry);
  const [selectedCategory, setSelectedCategory] = useState<PreferredCategory>(defaultCategory);
  const [showOtherData, setShowOtherData] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with preferences on mount (Zustand hydration)
  useEffect(() => {
    setMounted(true);
    setSelectedCountry(usePreferencesStore.getState().defaultCountry);
    setSelectedCategory(usePreferencesStore.getState().defaultCategory);
  }, []);

  // Filter data
  const primaryRow = allMovementData.find(
    (r) => r.country === selectedCountry && r.category === selectedCategory,
  );

  // All rows for the selected country (for the "Your Country" section)
  const countryRows = allMovementData.filter(
    (r) => r.country === selectedCountry,
  );

  // Other countries data
  const otherRows = allMovementData.filter(
    (r) => r.country !== selectedCountry,
  );

  // Hope context rows (movements for selected country)
  const hopeRows = countryRows.filter((r) => r.direction !== "none").slice(0, 2);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="VisaDateTracker"
        subtitle="Your green card priority date companion"
        action={
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
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
        {/* ── Country & Category Selectors ── */}
        <motion.div variants={item}>
          <nav aria-label="Country and category filters" className="space-y-3">
            {/* Country chips */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Country of Charge
              </label>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select country">
                {COUNTRIES_BY_QUEUE.map((c) => {
                  const isActive = c === selectedCountry;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setSelectedCountry(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-calm-blue text-white shadow-md"
                          : "border border-border bg-card text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category segmented control */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visa Category
              </label>
              <div
                className="inline-flex rounded-xl bg-muted p-1 shadow-inner"
                role="radiogroup"
                aria-label="Select visa category"
              >
                {CATEGORIES.map((c) => {
                  const isActive = c === selectedCategory;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setSelectedCategory(c)}
                      className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-calm-blue text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </motion.div>

        {/* ── Hero / Bulletin Month ── */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-[18px] border-0 bg-gradient-to-br from-[#2F6BFF] to-[#1B4FCC] text-white shadow-lg dark:from-[#1B4FCC] dark:to-[#0F2E80]">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-white/70">
                Current Bulletin
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                March 2026
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Showing {selectedCategory} {selectedCountry} — Final Action and Filing Dates.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Primary Personalized Card ── */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your {selectedCategory} Status
          </h3>
          <AnimatePresence mode="wait">
            {primaryRow && (
              <motion.div
                key={`${primaryRow.country}-${primaryRow.category}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="relative overflow-hidden rounded-[18px] border-2 border-calm-blue/20 shadow-md dark:border-calm-blue/10">
                  {/* Priority Pulse — subtle radial glow keyed to status */}
                  <div
                    className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-30 transition-colors duration-700 ${
                      primaryRow.finalAction.kind === "current"
                        ? "bg-success-emerald"
                        : primaryRow.direction === "backward"
                          ? "bg-alert-rose"
                          : "bg-calm-blue"
                    }`}
                    aria-hidden="true"
                  />
                  <CardContent className="relative z-10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-calm-blue/10 text-calm-blue dark:bg-calm-blue/20 dark:text-calm-blue text-[10px] font-semibold uppercase hover:bg-calm-blue/10">
                            {primaryRow.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                            {primaryRow.country}
                          </Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Final Action Date
                            </p>
                            <p className={`mt-0.5 text-xl font-bold tracking-tight ${cutoffValueClasses(primaryRow.finalAction)}`}>
                              {formatCutoffValue(primaryRow.finalAction)}
                            </p>
                          </div>
                          <Separator className="my-1" />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Filing Date
                            </p>
                            <p className={`mt-0.5 text-lg font-semibold ${cutoffValueClasses(primaryRow.filingDate)}`}>
                              {formatCutoffValue(primaryRow.filingDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <VelocityArc direction={primaryRow.direction} movement={primaryRow.movement} size="md" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Other categories for selected country ── */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            All {selectedCountry} Categories
          </h3>
          <div className="flex flex-col gap-3">
            {countryRows
              .filter((r) => r.category !== selectedCategory)
              .map((row) => (
                <MovementCard key={`${row.country}-${row.category}`} row={row} />
              ))}
          </div>
        </motion.div>

        {/* ── What Changed This Month ── */}
        <motion.div variants={item}>
          <ShimmerReveal delay={0.3}>
            <Card className="rounded-[18px] border border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  What Changed This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  EB1 India advanced by one month to March 2023. EB2 India saw
                  forward movement of two months to September 2013. EB3 India
                  remained unchanged at November 2013.
                </p>
                <p>
                  Filing dates were not advanced for the March bulletin. Consular
                  processing applicants should verify dates with their NVC case.
                </p>
              </CardContent>
            </Card>
          </ShimmerReveal>
        </motion.div>

        {/* ── Hope Context ── */}
        {hopeRows.length > 0 && (
          <motion.div variants={item} className="flex flex-col gap-3">
            {hopeRows.map((row) => (
              <HopeContext
                key={`${row.category} ${row.country}`}
                direction={row.direction}
                category={`${row.category} ${row.country}`}
                movement={row.movement}
              />
            ))}
          </motion.div>
        )}

        {/* ── Other Countries (Progressive Disclosure) ── */}
        <motion.div variants={item}>
          <button
            onClick={() => setShowOtherData((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-[18px] bg-muted/60 px-5 py-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
            aria-expanded={showOtherData}
            aria-controls="other-countries-data"
          >
            <span className="text-sm font-semibold text-foreground">
              Other Countries &amp; Categories
            </span>
            <motion.span
              animate={{ rotate: showOtherData ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence>
            {showOtherData && (
              <motion.div
                id="other-countries-data"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="overflow-hidden"
                aria-live="polite"
              >
                <div className="flex flex-col gap-3 pt-3">
                  {otherRows.map((row) => (
                    <MovementCard key={`${row.country}-${row.category}`} row={row} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Top News Preview ── */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Top News
          </h3>
          <div className="flex flex-col gap-3">
            {newsPreview.map((article) => (
              <Card
                key={article.id}
                className="rounded-[18px] border border-border/50 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-semibold uppercase"
                    >
                      {article.badge}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {article.date}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                    {article.headline}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ── Share Your Update ── */}
        {primaryRow && (
          <motion.div variants={item}>
            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Share Your Update
            </h3>
            <JourneySnapshot
              category={primaryRow.category}
              country={primaryRow.country}
              priorityDate={formatCutoffValue(primaryRow.finalAction)}
              currentFinalAction={formatCutoffValue(primaryRow.finalAction)}
              movement={primaryRow.movement}
              direction={primaryRow.direction}
              bulletinMonth="March 2026"
            />
          </motion.div>
        )}

        {/* ── Customize prompt ── */}
        <motion.div variants={item}>
          <Link
            href="/settings"
            className="flex items-center justify-center gap-2 rounded-[18px] border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-calm-blue/40 hover:text-calm-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
          >
            <Settings className="h-4 w-4" />
            Customize your defaults in Settings
          </Link>
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.div variants={item}>
          <p className="mt-2 rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            This app provides informational tracking only. It does not
            constitute legal advice. Visa bulletin data is sourced from the U.S.
            Department of State. Always consult an immigration attorney for
            guidance specific to your situation.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
