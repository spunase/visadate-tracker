"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { MovementBarChart } from "@/components/charts/movement-bar-chart";
import { TrendNarrative } from "@/components/charts/trend-narrative";
import { useHistory } from "@/lib/hooks/use-history";
import { useState, useEffect } from "react";
import { VelocityArc } from "@/components/ui/velocity-arc";
import { ShimmerReveal } from "@/components/ui/shimmer-reveal";
import {
  usePreferencesStore,
  COUNTRIES_BY_QUEUE,
  CATEGORY_GROUPS,
  type PreferredCategory,
  type PreferredCountry,
  type CategoryGroup,
} from "@/stores/preferences-store";

const ebCategories = ["EB1", "EB2", "EB3"] as const;
const familyCategories = ["F1", "F2A", "F2B", "F3", "F4"] as const;
const countries = COUNTRIES_BY_QUEUE;
const chartModes = ["Final Action", "Filing"] as const;

function groupForCategory(cat: string): CategoryGroup {
  return (ebCategories as readonly string[]).includes(cat) ? "Employment" : "Family";
}

function categoriesForGroup(group: CategoryGroup) {
  return CATEGORY_GROUPS.find((g) => g.label === group)!.categories;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

function RetrogradeCard({
  category,
  country,
  monthLabel,
  movementDays,
}: {
  category: string;
  country: string;
  monthLabel: string;
  movementDays: number;
}) {
  const [showNarrative, setShowNarrative] = useState(false);

  return (
    <Card
      className="riso-doc-coral relative rounded-[18px] border border-border/50 shadow-sm"
      onMouseEnter={() => setShowNarrative(true)}
      onMouseLeave={() => setShowNarrative(false)}
      onFocus={() => setShowNarrative(true)}
      onBlur={() => setShowNarrative(false)}
      tabIndex={0}
      role="button"
      aria-expanded={showNarrative}
      aria-label={`Retrogression ${category} ${country} ${monthLabel} — hover for details`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-[10px] font-semibold">
            Retrogression
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {category} {country}
          </Badge>
          <span className="text-[11px] text-muted-foreground">{monthLabel}</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Moved backward by {movementDays} day{movementDays !== 1 ? "s" : ""}.
        </p>
        <div className="mt-2">
          <VelocityArc direction="backward" movement="Retrogressed" size="sm" />
        </div>
      </CardContent>

      {/* Hover narrative tooltip */}
      {showNarrative && (
        <div className="absolute left-3 right-3 bottom-full z-20 mb-2 rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/60 p-3 shadow-lg ring-1 ring-rose-300/20 dark:border-rose-800/40 dark:from-rose-950/80 dark:to-rose-900/40">
          <p className="font-heading text-xs font-semibold text-foreground">
            A temporary setback
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            The {category} {country} category retrogressed by historical retrogression.
            While any backward movement can feel discouraging, historical patterns show
            that retrogressions are typically followed by recovery within 2-4 months.
            This is a normal part of the process, not a permanent change.
          </p>
          {/* Arrow pointing down */}
          <div className="absolute left-6 -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-rose-200/60 bg-rose-100/60 dark:border-rose-800/40 dark:bg-rose-900/40" />
        </div>
      )}
    </Card>
  );
}

export default function TrendsPage() {
  const { defaultCategory, defaultCountry } = usePreferencesStore();

  const initGroup = groupForCategory(defaultCategory);
  const initCategory = defaultCategory;
  const initCountry = countries.includes(defaultCountry) ? defaultCountry : "India";

  const [activeGroup, setActiveGroup] = useState<CategoryGroup>(initGroup);
  const [category, setCategory] = useState<PreferredCategory>(initCategory);
  const [country, setCountry] = useState<PreferredCountry>(initCountry);
  const [chartMode, setChartMode] =
    useState<(typeof chartModes)[number]>("Final Action");

  // Re-sync when store changes (e.g. user navigated from home with a new selection)
  useEffect(() => {
    const grp = groupForCategory(defaultCategory);
    setActiveGroup(grp);
    setCategory(defaultCategory);
    const cty = countries.includes(defaultCountry) ? defaultCountry : country;
    setCountry(cty);
  }, [defaultCategory, defaultCountry]);

  const handleGroupChange = (group: CategoryGroup) => {
    setActiveGroup(group);
    setCategory(categoriesForGroup(group)[0]);
  };

  const visibleCategories = categoriesForGroup(activeGroup);

  const { history, isLoading, error } = useHistory(category, country, chartMode);

  const retrogressions = history.filter(
    (h) => h.movementDirection === "backward",
  );

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Trends" subtitle="Priority date movement over time" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pb-8"
      >
        {/* Country & Category Selectors — consistent with home screen */}
        <motion.div variants={item}>
          <nav aria-label="Country and category filters" className="space-y-3">
            {/* Country chips */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Country of Charge
              </label>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select country">
                {countries.map((c) => {
                  const isActive = c === country;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setCountry(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#2F6BFF] text-white shadow-md"
                          : "border border-border bg-card text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

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
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#2F6BFF] text-white shadow-sm"
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
                {visibleCategories.map((c) => {
                  const isActive = c === category;
                  return (
                    <button
                      key={c}
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setCategory(c)}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#2F6BFF] text-white shadow-sm"
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

        {/* Chart Mode Toggle */}
        <motion.div variants={item}>
          <div className="flex rounded-xl bg-muted p-1" role="radiogroup" aria-label="Chart mode">
            {chartModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                role="radio"
                aria-checked={chartMode === mode}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                  chartMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Trend Line Chart */}
        <motion.div variants={item}>
          <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {category} {country} &mdash; {chartMode} Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {error ? (
                <div className="flex h-48 items-center justify-center rounded-xl bg-muted/40">
                  <p className="text-xs text-destructive">
                    Failed to load chart data. Please try again later.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-muted/40">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Loading trend data&hellip;
                  </p>
                </div>
              ) : (
                <TrendLineChart
                  data={history}
                  category={category}
                  country={country}
                  chartMode={chartMode}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Movement Bar Chart */}
        <motion.div variants={item}>
          <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Monthly Movement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {error ? (
                <div className="flex h-24 items-center justify-center rounded-xl bg-muted/40">
                  <p className="text-xs text-destructive">Unable to load.</p>
                </div>
              ) : isLoading ? (
                <Skeleton className="h-24 w-full rounded-lg" />
              ) : (
                <MovementBarChart data={history} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Movement Narrative */}
        <motion.div variants={item}>
          <ShimmerReveal delay={0.2}>
          <Card className="riso-doc-gold-accent rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Movement Narrative
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-xs text-destructive">
                  Unable to generate narrative.
                </p>
              ) : isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : (
                <TrendNarrative
                  data={history}
                  category={category}
                  country={country}
                  chartMode={chartMode}
                />
              )}
            </CardContent>
          </Card>
          </ShimmerReveal>
        </motion.div>

        {/* Retrogression History */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Retrogression History
          </h3>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-[18px]" />
              ))}
            </div>
          ) : retrogressions.length === 0 ? (
            <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  No retrogressions in the last {history.length} months for{" "}
                  {category} {country}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {retrogressions.map((event, i) => {
                const monthDate = new Date(event.bulletinMonth + "-01");
                const monthLabel = monthDate.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });

                return (
                  <RetrogradeCard
                    key={i}
                    category={category}
                    country={country}
                    monthLabel={monthLabel}
                    movementDays={Math.abs(event.movementDays)}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
