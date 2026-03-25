"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Info, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/ui/source-badge";
import { FreshnessIndicator } from "@/components/ui/freshness-indicator";
import { useNews, type NewsArticle } from "@/lib/hooks/use-news";
import { NEWS_DISCLAIMER } from "@/lib/content/disclaimers";

// ---------------------------------------------------------------------------
// Tab configuration
// ---------------------------------------------------------------------------

const NEWS_TABS = ["All", "USCIS/DOS", "H-1B", "Employment-Based"] as const;
type NewsTab = (typeof NEWS_TABS)[number];

// ---------------------------------------------------------------------------
// Topic-based category colors
// ---------------------------------------------------------------------------

const topicColor: Record<string, string> = {
  visa_bulletin:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  eb_filing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  h1b_updates:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  uscis_official:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  dos_official:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  fees_processing:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  policy_manual:
    "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
};

function getTopicColor(topic: string): string {
  return (
    topicColor[topic] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300"
  );
}

/** Map a topic string to a human label for the badge. */
function topicLabel(topic: string): string {
  const labels: Record<string, string> = {
    visa_bulletin: "Visa Bulletin",
    eb_filing: "EB Filing",
    h1b_updates: "H-1B",
    uscis_official: "USCIS",
    dos_official: "DOS",
    fees_processing: "Fees & Processing",
    policy_manual: "Policy Manual",
  };
  return labels[topic] ?? topic;
}

// ---------------------------------------------------------------------------
// Filter logic
// ---------------------------------------------------------------------------

function filterByTab(articles: NewsArticle[], tab: NewsTab): NewsArticle[] {
  switch (tab) {
    case "All":
      return articles;
    case "USCIS/DOS":
      return articles.filter(
        (a) =>
          a.publisher === "DOS" ||
          a.publisher === "USCIS" ||
          a.topic === "dos_official" ||
          a.topic === "uscis_official"
      );
    case "H-1B":
      return articles.filter((a) => a.topic === "h1b_updates");
    case "Employment-Based":
      return articles.filter(
        (a) => a.topic === "eb_filing" || a.topic === "visa_bulletin"
      );
    default:
      return articles;
  }
}

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function NewsCardSkeleton() {
  return (
    <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
        <Skeleton className="mt-3 h-4 w-full rounded-md" />
        <Skeleton className="mt-1 h-4 w-3/4 rounded-md" />
        <Skeleton className="mt-3 h-3 w-full rounded-md" />
        <Skeleton className="mt-1 h-3 w-2/3 rounded-md" />
        <Skeleton className="mt-3 h-3 w-24 rounded-md" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState<NewsTab>("All");
  const { news, isLoading, error } = useNews();

  const filtered = filterByTab(news, activeTab);

  // Split into top news (3 most recent) and rest
  const topNews = filtered.slice(0, 3);
  const recentNews = filtered.slice(3);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="News" subtitle="Official updates and filings" />

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {NEWS_TABS.map((tab) => (
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

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-900/20">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <NewsCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Top News */}
        {!isLoading && !error && topNews.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Top News
            </h3>
            <motion.div
              key={`top-${activeTab}`}
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              {topNews.map((article) => (
                <motion.div key={article.id} variants={item}>
                  <Card className="riso-doc-teal rounded-[18px] border border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getTopicColor(article.topic)}`}
                        >
                          {topicLabel(article.topic)}
                        </span>
                        <SourceBadge
                          source={article.source_type === "official" ? "official" : "derived"}
                          label={article.publisher}
                        />
                        <FreshnessIndicator
                          updatedAt={new Date(article.published_at)}
                          staleAfterDays={14}
                          freshWithinDays={2}
                        />
                      </div>

                      {/* Title */}
                      <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
                        {article.title}
                      </p>

                      {/* Summary */}
                      {article.summary && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {article.summary}
                        </p>
                      )}

                      {/* Why it matters */}
                      {article.why_it_matters && (
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                          <span className="font-medium text-foreground/70">
                            Why it matters:
                          </span>{" "}
                          {article.why_it_matters}
                        </p>
                      )}

                      {/* Source link */}
                      {article.source_url && (
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>
                            {(() => {
                              try {
                                return new URL(article.source_url).hostname.replace(
                                  /^www\./,
                                  ""
                                );
                              } catch {
                                return article.source_url;
                              }
                            })()}
                          </span>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Divider between top and recent */}
        {!isLoading && !error && recentNews.length > 0 && (
          <div className="riso-divider my-2" aria-hidden="true" />
        )}

        {/* Recent News */}
        {!isLoading && !error && recentNews.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent News
            </h3>
            <motion.div
              key={`recent-${activeTab}`}
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              {recentNews.map((article) => (
                <motion.div key={article.id} variants={item}>
                  <Card className="riso-doc-coral-accent rounded-[18px] border border-border/50 shadow-sm">
                    <CardContent className="p-4">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${getTopicColor(article.topic)}`}
                        >
                          {topicLabel(article.topic)}
                        </span>
                        <SourceBadge
                          source={article.source_type === "official" ? "official" : "derived"}
                          label={article.publisher}
                        />
                        <FreshnessIndicator
                          updatedAt={new Date(article.published_at)}
                          staleAfterDays={14}
                          freshWithinDays={2}
                        />
                      </div>

                      {/* Title */}
                      <p className="mt-2 text-sm font-semibold leading-snug text-foreground">
                        {article.title}
                      </p>

                      {/* Summary */}
                      {article.summary && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {article.summary}
                        </p>
                      )}

                      {/* Source link */}
                      {article.source_url && (
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>
                            {(() => {
                              try {
                                return new URL(article.source_url).hostname.replace(
                                  /^www\./,
                                  ""
                                );
                              } catch {
                                return article.source_url;
                              }
                            })()}
                          </span>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="rounded-xl bg-muted/40 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {news.length === 0
                ? "No news available at this time."
                : "No articles match this filter."}
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="riso-doc-gold-accent flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {NEWS_DISCLAIMER.text}
          </p>
        </div>
      </div>
    </div>
  );
}
