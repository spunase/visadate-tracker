"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const newsTabs = ["All", "USCIS/DOS", "H-1B", "Employment-Based"] as const;
type NewsTab = (typeof newsTabs)[number];

interface NewsItem {
  id: string;
  category: "USCIS/DOS" | "H-1B" | "Employment-Based";
  headline: string;
  whyItMatters: string;
  source: string;
  date: string;
  official: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    category: "USCIS/DOS",
    headline: "March 2026 Visa Bulletin Published by Department of State",
    whyItMatters:
      "Updates final action and filing dates for all employment-based preference categories. Check if your priority date is now current.",
    source: "travel.state.gov",
    date: "Mar 10, 2026",
    official: true,
  },
  {
    id: "2",
    category: "H-1B",
    headline: "FY2027 H-1B Electronic Registration Period: April 1-18",
    whyItMatters:
      "Employers must register beneficiaries during this window. Selected registrations will be notified by April 30.",
    source: "uscis.gov",
    date: "Mar 8, 2026",
    official: true,
  },
  {
    id: "3",
    category: "Employment-Based",
    headline: "USCIS Updates Premium Processing Eligibility for I-140",
    whyItMatters:
      "Premium processing expanded to additional I-140 classifications, reducing processing time to 45 calendar days.",
    source: "uscis.gov",
    date: "Mar 5, 2026",
    official: true,
  },
  {
    id: "4",
    category: "USCIS/DOS",
    headline: "Filing Dates Chart Available for March AOS Filings",
    whyItMatters:
      "USCIS confirms applicants may use Filing Dates chart for March I-485 filings in employment-based categories.",
    source: "uscis.gov",
    date: "Mar 3, 2026",
    official: true,
  },
  {
    id: "5",
    category: "Employment-Based",
    headline: "EB-5 Regional Center Program Updates Processing Priorities",
    whyItMatters:
      "New processing priority framework may affect petition adjudication timelines for EB-5 investors.",
    source: "uscis.gov",
    date: "Feb 28, 2026",
    official: true,
  },
  {
    id: "6",
    category: "H-1B",
    headline: "DOL Proposes Prevailing Wage Methodology Changes",
    whyItMatters:
      "Proposed rule could affect wage levels used for H-1B and PERM labor certifications across all occupations.",
    source: "dol.gov",
    date: "Feb 25, 2026",
    official: false,
  },
];

const categoryColor: Record<NewsItem["category"], string> = {
  "USCIS/DOS": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "H-1B": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "Employment-Based": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<NewsTab>("All");

  const filtered =
    activeTab === "All"
      ? newsItems
      : newsItems.filter((n) => n.category === activeTab);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="News" subtitle="Official updates and filings" />

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {newsTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* News Cards */}
        <motion.div
          key={activeTab}
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {filtered.map((article) => (
            <motion.div key={article.id} variants={item}>
              <Card className="rounded-[18px] border border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${categoryColor[article.category]}`}
                    >
                      {article.category}
                    </span>
                    {article.official && (
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <ShieldCheck className="h-3 w-3" />
                        Official
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {article.date}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
                    {article.headline}
                  </p>

                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground/70">
                      Why it matters:
                    </span>{" "}
                    {article.whyItMatters}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    <span>{article.source}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Always read official sources directly for the most accurate and
            up-to-date information. News summaries are provided for convenience
            and may not capture all nuances of policy changes.
          </p>
        </div>
      </div>
    </div>
  );
}
