"use client";

import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

// ─── Types ─────────────────────────────────────────────────────

export interface JourneyProgressProps {
  /** User's priority date as ISO string (YYYY-MM-DD) */
  priorityDate: string;
  /** Current Final Action Date as ISO string (YYYY-MM-DD) */
  currentFinalAction: string;
  /** Current Dates-for-Filing cutoff as ISO string (YYYY-MM-DD), optional */
  currentFiling?: string;
  /** Visa category, e.g. "EB-2", "EB-3" */
  category: string;
  /** Country of chargeability, e.g. "India", "China" */
  country: string;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function parseDate(iso: string): Date {
  return new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 86_400_000;
}

/**
 * Roll a date back to the start of its calendar quarter.
 * Q1: Jan 1, Q2: Apr 1, Q3: Jul 1, Q4: Oct 1
 */
function quarterStart(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3; // 0, 3, 6, 9
  return new Date(d.getFullYear(), q, 1);
}

/**
 * Smart baseline: quarter-start before the earlier of FA/Filing dates.
 * This keeps the bar focused on the meaningful range rather than an
 * arbitrary 10-year lookback.
 */
function computeBaseline(finalAction: string, filing?: string): Date {
  const fa = parseDate(finalAction);
  const fl = filing ? parseDate(filing) : fa;
  const earlier = fa < fl ? fa : fl;
  return quarterStart(earlier);
}

/**
 * Compute the fill percentage of the progress bar.
 * 0 % = baseline (quarter-start before earlier cutoff)
 * 100 % = priority date (the finish line on the right)
 *
 * We position the Final Action date along this range.
 */
function computeProgress(
  baseline: Date,
  priorityDate: string,
  finalAction: string,
): number {
  const pd = parseDate(priorityDate);
  const fa = parseDate(finalAction);

  if (fa >= pd) return 100;

  const totalDays = daysBetween(baseline, pd);
  if (totalDays <= 0) return 100;

  const elapsedDays = daysBetween(baseline, fa);
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}

/**
 * Position a date on the bar as a percentage.
 */
function dateToPosition(baseline: Date, pdDate: Date, target: Date): number {
  const totalDays = daysBetween(baseline, pdDate);
  if (totalDays <= 0) return 100;
  const elapsed = daysBetween(baseline, target);
  return Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
}

/**
 * Dynamic milestones — evenly-spaced date labels along the bar.
 * Count adapts to the span: 2 markers for short spans, 3 for longer.
 */
function computeMilestones(
  baseline: Date,
  pdDate: Date,
): { position: number; label: string }[] {
  const totalDays = daysBetween(baseline, pdDate);
  // For short spans (< 2 years) use 2 markers; otherwise 3
  const count = totalDays < 730 ? 2 : 3;
  const step = 100 / (count + 1); // evenly spaced excluding 0 and 100

  return Array.from({ length: count }, (_, i) => {
    const pct = step * (i + 1);
    const daysIn = totalDays * (pct / 100);
    const d = new Date(baseline.getTime() + daysIn * 86_400_000);
    const label = d.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
    });
    return { position: pct, label };
  });
}

// ─── Animation variants ───────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const barVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (pct: number) => ({
    scaleX: pct / 100,
    transition: { duration: 1, ease: "easeOut", delay: 0.2 },
  }),
};

const celebrationVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20, delay: 0.6 },
  },
};

// ─── Component ─────────────────────────────────────────────────

export function JourneyProgress({
  priorityDate,
  currentFinalAction,
  currentFiling,
  category,
  country,
  className,
}: JourneyProgressProps) {
  const prefersReduced = useReducedMotion();

  const {
    progress,
    milestones,
    isCurrent,
    baseline,
    pdDate,
    faPosition,
    filingPosition,
    filingLabel,
  } = useMemo(() => {
    const bl = computeBaseline(currentFinalAction, currentFiling);
    const pd = parseDate(priorityDate);
    const prog = computeProgress(bl, priorityDate, currentFinalAction);
    const ms = computeMilestones(bl, pd);
    const faPct = dateToPosition(bl, pd, parseDate(currentFinalAction));

    let flPct: number | null = null;
    let flLabel: string | null = null;
    if (currentFiling) {
      flPct = dateToPosition(bl, pd, parseDate(currentFiling));
      flLabel = formatDate(currentFiling);
    }

    return {
      progress: prog,
      milestones: ms,
      isCurrent: prog >= 100,
      baseline: bl,
      pdDate: pd,
      faPosition: faPct,
      filingPosition: flPct,
      filingLabel: flLabel,
    };
  }, [priorityDate, currentFinalAction, currentFiling]);

  // The "effective" cutoff shown in the fill is whichever is further along (closer to PD)
  const effectiveFill = Math.max(
    progress,
    filingPosition != null ? filingPosition : 0,
  );

  return (
    <motion.div
      variants={prefersReduced ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] bg-card p-[var(--spacing-card-padding)] ring-1 ring-foreground/10 shadow-[var(--shadow-card)]",
        isCurrent && "ring-success-emerald/30 dark:ring-success-emerald/40",
        className,
      )}
      role="region"
      aria-label={`Journey progress for ${category} ${country}: ${Math.round(progress)}%`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className="size-4 shrink-0 text-calm-blue"
              aria-hidden="true"
            />
            <p className="text-caption font-semibold text-card-foreground">
              Journey Progress
            </p>
          </div>
          <p className="mt-0.5 text-tiny text-muted-foreground">
            {category} &middot; {country}
          </p>
        </div>

        {/* Percentage badge with explainer tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className={cn(
                "inline-flex cursor-help items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-caption font-semibold",
                isCurrent
                  ? "bg-status-current text-status-current-foreground"
                  : "bg-status-filing text-status-filing-foreground",
              )}
            >
              {isCurrent ? "Current!" : `${Math.round(progress)}%`}
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {isCurrent
                ? "The Final Action cutoff has reached your priority date — you\u2019re current!"
                : `The Final Action date has covered ${Math.round(progress)}% of the distance from the earliest cutoff to your priority date.`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {/* Gradient fill — extends to whichever cutoff is further along */}
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-calm-blue to-success-emerald"
            variants={prefersReduced ? undefined : barVariants}
            initial="hidden"
            animate="visible"
            custom={effectiveFill}
            style={
              prefersReduced
                ? { transform: `scaleX(${effectiveFill / 100})` }
                : undefined
            }
          />

          {/* Final Action Date — vertical marker */}
          <div
            className="absolute top-0 z-10 flex h-full flex-col items-center"
            style={{ left: `${faPosition}%` }}
            aria-hidden="true"
          >
            <div className="h-full w-[3px] rounded-full bg-calm-blue shadow-sm" />
          </div>

          {/* Filing Date — vertical marker (if available and different from FA) */}
          {filingPosition != null &&
            Math.abs(filingPosition - faPosition) > 1.5 && (
              <div
                className="absolute top-0 z-10 flex h-full flex-col items-center"
                style={{ left: `${filingPosition}%` }}
                aria-hidden="true"
              >
                <div className="h-full w-[2px] rounded-full bg-insight-teal opacity-70" />
              </div>
            )}

          {/* Milestone markers */}
          {milestones.map((m) => (
            <div
              key={m.position}
              className="absolute top-0 h-full w-px bg-foreground/15 dark:bg-foreground/20"
              style={{ left: `${m.position}%` }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* FA / Filing indicator labels — positioned above the bar */}
        <div className="relative mt-0.5 h-4">
          {/* FA label */}
          <span
            className="absolute -translate-x-1/2 text-[10px] font-semibold text-calm-blue"
            style={{
              left: `${Math.min(92, Math.max(8, faPosition))}%`,
            }}
          >
            FA
          </span>

          {/* Filing label */}
          {filingPosition != null &&
            Math.abs(filingPosition - faPosition) > 8 && (
              <span
                className="absolute -translate-x-1/2 text-[10px] font-semibold text-insight-teal"
                style={{
                  left: `${Math.min(92, Math.max(8, filingPosition))}%`,
                }}
              >
                DF
              </span>
            )}
        </div>

        {/* Milestone labels */}
        <div className="relative h-4">
          {milestones.map((m) => (
            <span
              key={m.position}
              className="absolute -translate-x-1/2 text-tiny text-muted-foreground"
              style={{ left: `${m.position}%` }}
              aria-hidden="true"
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Date labels — Filing (or baseline) on LEFT, PD on RIGHT */}
      <div className="mt-2 flex items-center justify-between text-tiny text-muted-foreground">
        <span>
          {currentFiling ? (
            <>
              Filing:{" "}
              <span className="font-medium text-card-foreground">
                {formatDate(currentFiling)}
              </span>
            </>
          ) : (
            <>
              FAD:{" "}
              <span className="font-medium text-card-foreground">
                {formatDate(currentFinalAction)}
              </span>
            </>
          )}
        </span>
        <span>
          PD:{" "}
          <span className="font-medium text-card-foreground">
            {formatDate(priorityDate)}
          </span>
        </span>
      </div>

      {/* Secondary date row when filing is shown — show FA below */}
      {currentFiling && (
        <div className="mt-0.5 flex items-center justify-between text-tiny text-muted-foreground">
          <span>
            FAD:{" "}
            <span className="font-medium text-card-foreground">
              {formatDate(currentFinalAction)}
            </span>
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            Bar start:{" "}
            {baseline.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Current celebration overlay */}
      {isCurrent && (
        <motion.div
          variants={prefersReduced ? undefined : celebrationVariants}
          initial={prefersReduced ? "visible" : "hidden"}
          animate="visible"
          className="mt-3 flex items-center gap-2 rounded-[var(--radius-sm)] bg-status-current px-3 py-2"
        >
          <CheckCircle2
            className="size-4 shrink-0 text-status-current-foreground"
            aria-hidden="true"
          />
          <p className="text-caption font-semibold text-status-current-foreground">
            Your priority date is current! You may file or expect adjudication.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
