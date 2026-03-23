"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, Bell } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Direction = "forward" | "backward" | "none";

const movementData: {
  category: string;
  finalAction: string;
  movement: string;
  direction: Direction;
}[] = [
  {
    category: "EB1 India",
    finalAction: "Jan 01, 2022",
    movement: "+2 months",
    direction: "forward",
  },
  {
    category: "EB2 India",
    finalAction: "Sep 01, 2012",
    movement: "+3 weeks",
    direction: "forward",
  },
  {
    category: "EB3 India",
    finalAction: "Jan 08, 2012",
    movement: "No change",
    direction: "none",
  },
];

const newsPreview = [
  {
    id: "1",
    badge: "USCIS",
    headline: "March 2026 Visa Bulletin Released",
    summary: "Department of State publishes updated priority dates for employment-based categories.",
    date: "Mar 10, 2026",
  },
  {
    id: "2",
    badge: "H-1B",
    headline: "FY2027 H-1B Registration Opens April 1",
    summary: "USCIS announces electronic registration period for H-1B cap-subject petitions.",
    date: "Mar 8, 2026",
  },
  {
    id: "3",
    badge: "Policy",
    headline: "USCIS Updates Filing Date Policy",
    summary: "New guidance on when Filing Date chart can be used for AOS applications.",
    date: "Mar 5, 2026",
  },
];

const directionIcon = {
  forward: <ArrowUpRight className="h-4 w-4 text-emerald-500" />,
  backward: <ArrowDownRight className="h-4 w-4 text-red-500" />,
  none: <Minus className="h-4 w-4 text-muted-foreground" />,
};

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

export default function HomePage() {
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
        {/* Hero / Bulletin Month */}
        <motion.div variants={item}>
          <Card className="overflow-hidden rounded-[18px] border-0 bg-gradient-to-br from-[#2F6BFF] to-[#1B4FCC] text-white shadow-lg">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-white/70">
                Current Bulletin
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                March 2026
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Visa Bulletin for employment-based preferences. Data below
                reflects Final Action Dates.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Movement Summary Cards */}
        <motion.div variants={item}>
          <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Key Movements
          </h3>
          <div className="flex flex-col gap-3">
            {movementData.map((row) => (
              <Card
                key={row.category}
                className="rounded-[18px] border border-border/50 shadow-sm"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {row.category}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Final Action: {row.finalAction}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {directionIcon[row.direction]}
                    <span
                      className={`text-sm font-medium ${
                        row.direction === "forward"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : row.direction === "backward"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {row.movement}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* What Changed This Month */}
        <motion.div variants={item}>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                What Changed This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                EB1 India advanced by two months, reflecting continued demand
                and available visa numbers. EB2 India saw modest forward
                movement of three weeks. EB3 India remained unchanged.
              </p>
              <p>
                Filing dates were not advanced for the March bulletin. Consular
                processing applicants should verify dates with their NVC case.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top News Preview */}
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

        {/* Disclaimer */}
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
