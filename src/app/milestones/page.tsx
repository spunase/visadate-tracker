"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckSquare,
  Square,
  Info,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MILESTONE_CARDS,
  getMilestonesByBand,
} from "@/lib/content/milestone-content";
import { MILESTONE_DISCLAIMER } from "@/lib/content/disclaimers";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { useMilestoneStore } from "@/stores/milestone-store";
import { useTrackerStore } from "@/stores/tracker-store";
import { useUserBand } from "@/lib/hooks/use-milestones";
import type { MilestoneBand } from "@/lib/content/types";

// ---------------------------------------------------------------------------
// Band configuration
// ---------------------------------------------------------------------------

const STATUS_BANDS: {
  key: MilestoneBand;
  label: string;
  color: string;
  dotColor: string;
}[] = [
  { key: "far", label: "Far", color: "bg-slate-400", dotColor: "bg-slate-400 dark:bg-slate-500" },
  { key: "approaching", label: "Approaching", color: "bg-amber-400", dotColor: "bg-amber-400 dark:bg-amber-500" },
  { key: "near", label: "Near", color: "bg-orange-400", dotColor: "bg-orange-400 dark:bg-orange-500" },
  { key: "very_near", label: "Very Near", color: "bg-rose-400", dotColor: "bg-rose-400 dark:bg-rose-500" },
  { key: "filing_current", label: "Filing Current", color: "bg-[#2F6BFF]", dotColor: "bg-[#2F6BFF]" },
  { key: "final_current", label: "Final Current", color: "bg-emerald-400", dotColor: "bg-emerald-400 dark:bg-emerald-500" },
];

function bandColor(band: MilestoneBand): string {
  return STATUS_BANDS.find((b) => b.key === band)?.color ?? "bg-slate-400";
}

function bandDotColor(band: MilestoneBand): string {
  return STATUS_BANDS.find((b) => b.key === band)?.dotColor ?? "bg-slate-400";
}

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
};

const checklistContainer = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: "auto" as const,
    opacity: 1,
    transition: {
      height: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2, delay: 0.05 },
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.15 },
    },
  },
};

const checklistItem = {
  hidden: { opacity: 0, x: -12, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, x: -8, transition: { duration: 0.1 } },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MilestonesPage() {
  const [activeBand, setActiveBand] = useState<MilestoneBand | "all">("all");
  const [confettiId, setConfettiId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const shouldReduceMotion = useReducedMotion();

  // Zustand stores
  const { checkedItems, toggleItem: storeToggleItem } = useMilestoneStore();

  const toggleItem = (id: string) => {
    if (!checkedItems[id]) {
      setConfettiId(id);
    }
    storeToggleItem(id);
  };

  const toggleCard = (cardId: string) => {
    setExpandedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const savedTrackers = useTrackerStore((s) => s.savedTrackers);
  const primaryTracker = savedTrackers.length > 0 ? savedTrackers[0] : null;

  // Determine user's band from bulletin data
  const { band: userBand, isLoading: bandLoading } = useUserBand(primaryTracker);

  // Filter cards
  const filtered =
    activeBand === "all"
      ? MILESTONE_CARDS
      : getMilestonesByBand(activeBand);

  // Count checked items per card
  const getCheckedCount = (cardId: string, total: number) => {
    let count = 0;
    for (let i = 0; i < total; i++) {
      if (checkedItems[`${cardId}-${i}`]) count++;
    }
    return count;
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Milestones" subtitle="Preparation checklist by status" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pb-8"
      >
        {/* Your Band indicator */}
        {primaryTracker && (
          <motion.div variants={item}>
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-3">
              {bandLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Determining your band...
                  </span>
                </>
              ) : userBand ? (
                <>
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${bandColor(userBand)}`}
                  />
                  <span className="text-xs font-medium text-foreground">
                    Your band:{" "}
                    <span className="font-semibold">
                      {STATUS_BANDS.find((b) => b.key === userBand)?.label ?? userBand}
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    ({primaryTracker.label})
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Could not determine your band. Check your tracker settings.
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Status Band Filter (wrapping pills) ── */}
        <motion.div variants={item}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveBand("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeBand === "all"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {STATUS_BANDS.map((band) => (
              <button
                key={band.key}
                onClick={() => setActiveBand(band.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeBand === band.key
                    ? "bg-foreground text-background shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${band.color}`} />
                {band.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Vertical Timeline ── */}
        <div className="relative mt-2">
          {/* Timeline spine */}
          <div
            className="milestone-timeline-line absolute left-[15px] top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-border via-border/60 to-border/30"
            aria-hidden="true"
          />

          {filtered.map((card, index) => {
            const isExpanded = !!expandedCards[card.id];
            const checkedCount = getCheckedCount(card.id, card.checklistItems.length);
            const allChecked = checkedCount === card.checklistItems.length;
            const isUserBand = userBand === card.band;

            return (
              <motion.div
                key={card.id}
                variants={item}
                className="relative pl-10 pb-8 last:pb-0"
              >
                {/* ── Timeline dot ── */}
                <div className="absolute left-0 top-0 flex items-center justify-center">
                  <span
                    className={`relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] transition-all duration-300 ${
                      allChecked
                        ? "border-emerald-400 bg-emerald-400 dark:border-emerald-500 dark:bg-emerald-500"
                        : isUserBand
                        ? `border-[#2F6BFF]/40 ${bandDotColor(card.band)}`
                        : `border-background ${bandDotColor(card.band)}`
                    } shadow-sm`}
                  >
                    {allChecked ? (
                      <CheckSquare className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <span className="text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    )}
                  </span>
                  {/* Pulse ring for user's current band */}
                  {isUserBand && !allChecked && (
                    <span
                      className="absolute inset-0 z-0 animate-ping rounded-full bg-[#2F6BFF]/20"
                      style={{ animationDuration: "2s" }}
                    />
                  )}
                </div>

                {/* ── Milestone Card ── */}
                <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${bandColor(card.band)}`}
                      />
                      <CardTitle className="text-base font-semibold">
                        {card.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {card.body}
                    </p>

                    {/* Source references */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {card.sourceRefs.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <ExternalLink className="h-2.5 w-2.5" />
                            {displayHost(url)}
                          </Badge>
                        </a>
                      ))}
                    </div>

                    {/* ── Checklist toggle button ── */}
                    <motion.button
                      onClick={() => toggleCard(card.id)}
                      className="mt-3 flex w-full items-center justify-between rounded-xl bg-muted/50 px-3.5 py-2.5 text-left transition-colors duration-200 hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-expanded={isExpanded}
                      aria-controls={`checklist-${card.id}`}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          Checklist
                        </span>
                        <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-sm">
                          {checkedCount}/{card.checklistItems.length}
                        </span>
                        {allChecked && (
                          <span className="text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
                            Complete
                          </span>
                        )}
                      </span>
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 300, damping: 20 }
                        }
                      >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.span>
                    </motion.button>

                    {/* ── Animated checklist reveal ── */}
                    <AnimatePresence mode="wait">
                      {isExpanded && (
                        <motion.div
                          id={`checklist-${card.id}`}
                          variants={checklistContainer}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-1.5 pt-2">
                            {card.checklistItems.map((text, idx) => {
                              const key = `${card.id}-${idx}`;
                              const isChecked = !!checkedItems[key];
                              return (
                                <motion.button
                                  key={key}
                                  variants={checklistItem}
                                  onClick={() => toggleItem(key)}
                                  className="relative flex items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                                >
                                  {isChecked ? (
                                    <motion.span
                                      initial={shouldReduceMotion ? false : { scale: 0.5 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                    >
                                      <CheckSquare className="riso-stamp mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                                    </motion.span>
                                  ) : (
                                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                  )}
                                  <span
                                    className={`text-sm transition-all duration-200 ${
                                      isChecked
                                        ? "text-muted-foreground line-through"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {text}
                                  </span>
                                  <ConfettiBurst
                                    trigger={confettiId === key}
                                    variant="sparkle"
                                  />
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div variants={item}>
            <div className="rounded-xl bg-muted/40 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No milestones for this band yet.
              </p>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div variants={item}>
          <div className="riso-doc-gold-accent flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {MILESTONE_DISCLAIMER.text}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
