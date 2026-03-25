"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Settings } from "lucide-react";
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
  CATEGORY_GROUPS,
  type PreferredCountry,
  type PreferredCategory,
} from "@/stores/preferences-store";
import { CountryFlagSelector } from "@/components/ui/country-flag-selector";
import { NotificationBell } from "@/components/notifications/notification-bell";

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

  // ── Family-Based Categories (March 2026 Visa Bulletin — official DOS source) ──
  // India
  { category: "F1", country: "India", finalAction: { kind: "date", value: "Jan 01, 2016" }, filingDate: { kind: "date", value: "Jan 01, 2017" }, movement: "+3 weeks", direction: "forward" },
  { category: "F2A", country: "India", finalAction: { kind: "date", value: "Sep 01, 2021" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "F2B", country: "India", finalAction: { kind: "date", value: "Jan 01, 2012" }, filingDate: { kind: "date", value: "Jan 01, 2013" }, movement: "No change", direction: "none" },
  { category: "F3", country: "India", finalAction: { kind: "date", value: "Oct 01, 2008" }, filingDate: { kind: "date", value: "Oct 01, 2009" }, movement: "+2 weeks", direction: "forward" },
  { category: "F4", country: "India", finalAction: { kind: "date", value: "Apr 15, 2006" }, filingDate: { kind: "date", value: "Aug 01, 2006" }, movement: "No change", direction: "none" },
  // China
  { category: "F1", country: "China", finalAction: { kind: "date", value: "Jan 01, 2016" }, filingDate: { kind: "date", value: "Jan 01, 2017" }, movement: "+3 weeks", direction: "forward" },
  { category: "F2A", country: "China", finalAction: { kind: "date", value: "Sep 01, 2021" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "F2B", country: "China", finalAction: { kind: "date", value: "Jun 08, 2017" }, filingDate: { kind: "date", value: "Apr 01, 2018" }, movement: "+2 weeks", direction: "forward" },
  { category: "F3", country: "China", finalAction: { kind: "date", value: "Jun 01, 2008" }, filingDate: { kind: "date", value: "Aug 01, 2009" }, movement: "No change", direction: "none" },
  { category: "F4", country: "China", finalAction: { kind: "date", value: "Jan 01, 2007" }, filingDate: { kind: "date", value: "Mar 01, 2008" }, movement: "+1 month", direction: "forward" },
  // Philippines
  { category: "F1", country: "Philippines", finalAction: { kind: "date", value: "Apr 01, 2013" }, filingDate: { kind: "date", value: "Oct 01, 2015" }, movement: "+1 month", direction: "forward" },
  { category: "F2A", country: "Philippines", finalAction: { kind: "date", value: "Sep 01, 2021" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "F2B", country: "Philippines", finalAction: { kind: "date", value: "Oct 22, 2012" }, filingDate: { kind: "date", value: "Oct 01, 2013" }, movement: "No change", direction: "none" },
  { category: "F3", country: "Philippines", finalAction: { kind: "date", value: "Nov 22, 2002" }, filingDate: { kind: "date", value: "Jun 01, 2005" }, movement: "+3 weeks", direction: "forward" },
  { category: "F4", country: "Philippines", finalAction: { kind: "date", value: "Mar 22, 2004" }, filingDate: { kind: "date", value: "Apr 01, 2006" }, movement: "No change", direction: "none" },
  // Mexico
  { category: "F1", country: "Mexico", finalAction: { kind: "date", value: "Apr 01, 2002" }, filingDate: { kind: "date", value: "Jun 01, 2005" }, movement: "+2 weeks", direction: "forward" },
  { category: "F2A", country: "Mexico", finalAction: { kind: "date", value: "Jun 01, 2021" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "F2B", country: "Mexico", finalAction: { kind: "date", value: "Jul 01, 2006" }, filingDate: { kind: "date", value: "Jul 01, 2007" }, movement: "No change", direction: "none" },
  { category: "F3", country: "Mexico", finalAction: { kind: "date", value: "Nov 15, 2000" }, filingDate: { kind: "date", value: "Aug 01, 2002" }, movement: "+2 weeks", direction: "forward" },
  { category: "F4", country: "Mexico", finalAction: { kind: "date", value: "Mar 01, 2001" }, filingDate: { kind: "date", value: "Mar 01, 2003" }, movement: "No change", direction: "none" },
  // All Other
  { category: "F1", country: "All Other", finalAction: { kind: "date", value: "Jan 01, 2016" }, filingDate: { kind: "date", value: "Jan 01, 2017" }, movement: "+3 weeks", direction: "forward" },
  { category: "F2A", country: "All Other", finalAction: { kind: "date", value: "Sep 01, 2021" }, filingDate: { kind: "date", value: "Jun 01, 2023" }, movement: "+1 month", direction: "forward" },
  { category: "F2B", country: "All Other", finalAction: { kind: "date", value: "Sep 22, 2017" }, filingDate: { kind: "date", value: "Apr 01, 2018" }, movement: "+2 weeks", direction: "forward" },
  { category: "F3", country: "All Other", finalAction: { kind: "date", value: "Nov 08, 2008" }, filingDate: { kind: "date", value: "Aug 01, 2009" }, movement: "No change", direction: "none" },
  { category: "F4", country: "All Other", finalAction: { kind: "date", value: "Mar 22, 2007" }, filingDate: { kind: "date", value: "Mar 01, 2008" }, movement: "+1 month", direction: "forward" },
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

/** Generate a dynamic "What Changed" narrative from movement data for a given country. */
function generateNarrative(rows: MovementRow[], country: PreferredCountry): string {
  if (rows.length === 0) return `No data available for ${country}.`;

  const parts = rows.map((row) => {
    const date = formatCutoffValue(row.finalAction);
    if (row.direction === "forward") {
      return `${row.category} ${country} advanced ${row.movement} to ${date}`;
    }
    if (row.direction === "backward") {
      return `${row.category} ${country} retrogressed ${row.movement} to ${date}`;
    }
    return `${row.category} ${country} remained unchanged at ${date}`;
  });

  return parts.join(". ") + ".";
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
    <Card className="riso-doc-coral rounded-[18px] border border-border/50 shadow-sm">
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
  const { defaultCountry, defaultCategory, setDefaultCountry, setDefaultCategory } = usePreferencesStore();

  // Derive active group from category
  const groupForCategory = (cat: PreferredCategory): "Employment" | "Family" =>
    (["EB1", "EB2", "EB3"] as PreferredCategory[]).includes(cat) ? "Employment" : "Family";

  // Local filter state (initialized from preferences)
  const [selectedCountry, setSelectedCountry] = useState<PreferredCountry>(defaultCountry);
  const [selectedCategory, setSelectedCategory] = useState<PreferredCategory>(defaultCategory);
  const [activeGroup, setActiveGroup] = useState<"Employment" | "Family">(groupForCategory(defaultCategory));
  const [showOtherData, setShowOtherData] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with preferences on mount (Zustand hydration)
  useEffect(() => {
    setMounted(true);
    const cat = usePreferencesStore.getState().defaultCategory;
    setSelectedCountry(usePreferencesStore.getState().defaultCountry);
    setSelectedCategory(cat);
    setActiveGroup(groupForCategory(cat));
  }, []);

  // Persist selections to store so other pages can read them
  const handleCountryChange = (country: PreferredCountry) => {
    setSelectedCountry(country);
    setDefaultCountry(country);
  };
  const handleCategoryChange = (category: PreferredCategory) => {
    setSelectedCategory(category);
    setDefaultCategory(category);
  };
  const handleGroupChange = (group: "Employment" | "Family") => {
    setActiveGroup(group);
    // Auto-select first category in the new group
    const firstCat = CATEGORY_GROUPS.find((g) => g.label === group)!.categories[0];
    handleCategoryChange(firstCat);
  };

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
        action={<NotificationBell />}
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
            {/* Country selector with flags */}
            <CountryFlagSelector
              value={selectedCountry}
              onChange={handleCountryChange}
              variant="cards"
            />

            {/* Employment / Family toggle */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visa Type
              </label>
              <div className="inline-flex rounded-xl bg-muted p-1 shadow-inner" role="radiogroup" aria-label="Select visa type">
                {(["Employment", "Family"] as const).map((group) => {
                  const isActive = group === activeGroup;
                  return (
                    <button
                      key={group}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => handleGroupChange(group)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-calm-blue text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {group}-Based
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selector — filtered by active group */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visa Category
              </label>
              <div
                className="inline-flex flex-wrap rounded-xl bg-muted p-1 shadow-inner"
                role="radiogroup"
                aria-label={`Select ${activeGroup.toLowerCase()} visa category`}
              >
                {CATEGORY_GROUPS.find((g) => g.label === activeGroup)!.categories.map((c) => {
                  const isActive = c === selectedCategory;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => handleCategoryChange(c)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2 ${
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
          <Card className="riso-doc-teal-strong overflow-hidden rounded-[18px] border-0 bg-gradient-to-br from-[#2F6BFF] to-[#1B4FCC] text-white shadow-lg dark:from-[#1B4FCC] dark:to-[#0F2E80]">
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

        <div className="riso-divider" aria-hidden="true" />

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
                <Card className="riso-doc-teal relative overflow-hidden rounded-[18px] border-2 border-calm-blue/20 shadow-md dark:border-calm-blue/10">
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
            <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  What Changed This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {generateNarrative(countryRows, selectedCountry)}
                </p>
                <p>
                  Filing dates may differ — consular processing applicants should
                  verify dates with their NVC case.
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
            className="riso-doc-gold flex items-center justify-center gap-2 rounded-[18px] border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-calm-blue/40 hover:text-calm-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
          >
            <Settings className="h-4 w-4" />
            Customize your defaults in Settings
          </Link>
        </motion.div>

        {/* ── Disclaimer ── */}
        <motion.div variants={item}>
          <p className="riso-doc-gold-accent mt-2 rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
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
