"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const categories = ["EB1", "EB2", "EB3"] as const;
const countries = ["India", "China", "All Other"] as const;
const chartModes = ["Final Action", "Filing"] as const;

const retrogressionHistory = [
  { date: "Oct 2024", category: "EB2 India", description: "Retrogressed by 6 months due to high demand." },
  { date: "Jul 2023", category: "EB3 India", description: "Retrogressed to Jan 2012 after brief advancement." },
  { date: "Oct 2022", category: "EB1 India", description: "Retrogressed for first time in FY2023." },
];

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
  const [chartMode, setChartMode] = useState<(typeof chartModes)[number]>("Final Action");

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
          <div className="flex gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 ${
                  category === c
                    ? "bg-[#2F6BFF] text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
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
          <div className="flex rounded-xl bg-muted p-1">
            {chartModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 ${
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

        {/* Chart Placeholder */}
        <motion.div variants={item}>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                {category} {country} &mdash; {chartMode} Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex h-48 flex-col items-center justify-center rounded-xl bg-muted/40">
                <Skeleton className="h-32 w-full rounded-lg" />
                <p className="mt-3 text-xs text-muted-foreground">
                  Chart will render historical priority date movement here.
                </p>
              </div>
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
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <p className="pt-2 text-xs">
                Narrative analysis will be generated from historical bulletin data.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Retrogression History */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Retrogression History
          </h3>
          <div className="flex flex-col gap-2">
            {retrogressionHistory.map((event, i) => (
              <Card
                key={i}
                className="rounded-[18px] border border-border/50 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px] font-semibold">
                      Retrogression
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {event.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {event.date}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
