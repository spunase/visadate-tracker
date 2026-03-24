"use client";

import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface JourneyProgressProps {
  /** User's priority date as ISO string (YYYY-MM-DD) */
  priorityDate: string;
  /** Current Final Action Date as ISO string (YYYY-MM-DD) */
  currentFinalAction: string;
  /** Visa category, e.g. "EB-2", "EB-3" */
  category: string;
  /** Country of chargeability, e.g. "India", "China" */
  country: string;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function parseDate(iso: string): Date {
  return new Date(iso);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function monthsBetween(a: Date, b: Date): number {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()) +
    (b.getDate() - a.getDate()) / 30
  );
}

/**
 * Calculate how far the Final Action Date has progressed
 * from a baseline toward (or past) the priority date.
 *
 * Baseline: We use a fixed reference point 10 years before
 * the priority date as 0%. When the final action date reaches
 * or passes the priority date it's 100% (current).
 */
function computeProgress(priorityDate: string, finalAction: string): number {
  const pd = parseDate(priorityDate);
  const fa = parseDate(finalAction);

  // If final action is at or past priority date => current
  if (fa >= pd) return 100;

  // Use a 10-year lookback as the baseline (0%)
  const baseline = new Date(pd);
  baseline.setFullYear(baseline.getFullYear() - 10);

  const totalSpan = monthsBetween(baseline, pd);
  const elapsed = monthsBetween(baseline, fa);

  if (totalSpan <= 0) return 100;
  return Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
}

/**
 * Generate milestone markers along the journey.
 * Placed at 25%, 50%, 75% of the total span.
 */
function computeMilestones(
  priorityDate: string,
): { position: number; label: string }[] {
  const pd = parseDate(priorityDate);
  const baseline = new Date(pd);
  baseline.setFullYear(baseline.getFullYear() - 10);

  return [25, 50, 75].map((pct) => {
    const months = monthsBetween(baseline, pd) * (pct / 100);
    const d = new Date(baseline);
    d.setMonth(d.getMonth() + Math.round(months));
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
  category,
  country,
  className,
}: JourneyProgressProps) {
  const prefersReduced = useReducedMotion();

  const progress = useMemo(
    () => computeProgress(priorityDate, currentFinalAction),
    [priorityDate, currentFinalAction],
  );

  const milestones = useMemo(
    () => computeMilestones(priorityDate),
    [priorityDate],
  );

  const isCurrent = progress >= 100;

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

        {/* Percentage badge */}
        <span
          className={cn(
            "inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-0.5 text-caption font-semibold",
            isCurrent
              ? "bg-status-current text-status-current-foreground"
              : "bg-status-filing text-status-filing-foreground",
          )}
        >
          {isCurrent ? "Current!" : `${Math.round(progress)}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {/* Gradient fill */}
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-calm-blue to-success-emerald"
            variants={prefersReduced ? undefined : barVariants}
            initial="hidden"
            animate="visible"
            custom={progress}
            style={
              prefersReduced
                ? { transform: `scaleX(${progress / 100})` }
                : undefined
            }
          />

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

        {/* Milestone labels */}
        <div className="relative mt-1 h-4">
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

      {/* Date labels */}
      <div className="mt-2 flex items-center justify-between text-tiny text-muted-foreground">
        <span>
          PD: <span className="font-medium text-card-foreground">{formatDate(priorityDate)}</span>
        </span>
        <span>
          FAD: <span className="font-medium text-card-foreground">{formatDate(currentFinalAction)}</span>
        </span>
      </div>

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
