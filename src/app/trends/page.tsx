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
import { useState } from "react";

const categories = ["EB1", "EB2", "EB3"] as const;
const countries = ["India", "China", "All Other"] as const;
const chartModes = ["Final Action", "Filing"] as const;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function TrendsPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("EB2");
  const [country, setCountry] = useState<(typeof countries)[number]>("India");
  const [chartMode, setChartMode] =
    useState<(typeof chartModes)[number]>("Final Action");

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
        {/* Category & Country Selectors */}
        <motion.div variants={item} className="flex flex-col gap-3">
          <div className="flex gap-2" role="radiogroup" aria-label="Category">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                role="radio"
                aria-checked={category === c}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                  category === c
                    ? "bg-[#2F6BFF] text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2" role="radiogroup" aria-label="Country">
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                role="radio"
                aria-checked={country === c}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                  country === c
                    ? "bg-foreground text-background shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
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
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
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
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
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
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
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
            <Card className="rounded-[18px] border border-border/50 shadow-sm">
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
                  <Card
                    key={i}
                    className="rounded-[18px] border border-border/50 shadow-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="text-[10px] font-semibold"
                        >
                          Retrogression
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {category} {country}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {monthLabel}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        Moved backward by {Math.abs(event.movementDays)} day
                        {Math.abs(event.movementDays) !== 1 ? "s" : ""}.
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
