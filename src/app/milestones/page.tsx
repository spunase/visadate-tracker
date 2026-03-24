"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Info, ExternalLink, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MILESTONE_CARDS, getMilestonesByBand } from "@/lib/content/milestone-content";
import { MILESTONE_DISCLAIMER } from "@/lib/content/disclaimers";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { useMilestoneStore } from "@/stores/milestone-store";
import { useTrackerStore } from "@/stores/tracker-store";
import { useUserBand } from "@/lib/hooks/use-milestones";
import type { MilestoneBand } from "@/lib/content/types";

// ---------------------------------------------------------------------------
// Band configuration
// ---------------------------------------------------------------------------

const STATUS_BANDS: { key: MilestoneBand; label: string; color: string }[] = [
  { key: "far", label: "Far", color: "bg-slate-400" },
  { key: "approaching", label: "Approaching", color: "bg-amber-400" },
  { key: "near", label: "Near", color: "bg-orange-400" },
  { key: "very_near", label: "Very Near", color: "bg-rose-400" },
  { key: "filing_current", label: "Filing Current", color: "bg-[#2F6BFF]" },
  { key: "final_current", label: "Final Current", color: "bg-emerald-400" },
];

function bandColor(band: MilestoneBand): string {
  return STATUS_BANDS.find((b) => b.key === band)?.color ?? "bg-slate-400";
}

// ---------------------------------------------------------------------------
// Framer Motion variants
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
// Helpers
// ---------------------------------------------------------------------------

/** Extract a readable hostname from a URL for display. */
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

  // Zustand stores
  const { checkedItems, toggleItem: storeToggleItem } = useMilestoneStore();

  const toggleItem = (id: string) => {
    if (!checkedItems[id]) {
      setConfettiId(id);
    }
    storeToggleItem(id);
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

        {/* Status Band Filter */}
        <motion.div variants={item}>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveBand("all")}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
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
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
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

        {/* Milestone Cards */}
        {filtered.map((card) => (
          <motion.div key={card.id} variants={item}>
            <Card className="rounded-[18px] border border-border/50 shadow-sm">
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

                {/* Interactive checklist */}
                <div className="mt-3 flex flex-col gap-2">
                  {card.checklistItems.map((text, idx) => {
                    const key = `${card.id}-${idx}`;
                    const isChecked = !!checkedItems[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleItem(key)}
                        className="relative flex items-start gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-muted/50"
                      >
                        {isChecked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm ${
                            isChecked
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {text}
                        </span>
                        <ConfettiBurst trigger={confettiId === key} variant="sparkle" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

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
          <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
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
