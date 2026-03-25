"use client";

import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { CalendarClock, PartyPopper, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type BulletinState = "available" | "expected" | "overdue";

export interface BulletinCountdownProps {
  /** Display name for the upcoming bulletin month, e.g. "April 2026" */
  nextMonth: string;
  /** Current release state */
  state: BulletinState;
  /** ISO date string for the expected release date (YYYY-MM-DD) */
  releaseDate?: string;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function daysUntil(target: string): number {
  const now = new Date();
  const release = new Date(target);
  // Strip time component for a clean day diff
  const todayMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMs = Date.UTC(
    release.getFullYear(),
    release.getMonth(),
    release.getDate(),
  );
  return Math.ceil((targetMs - todayMs) / (1000 * 60 * 60 * 24));
}

/**
 * Estimate the next bulletin release window.
 * The State Department typically publishes around the 8th–15th
 * of each month, for the following month.
 */
function estimateReleaseDate(): string {
  const now = new Date();
  // Target the 12th of the current month as a midpoint estimate
  const target = new Date(now.getFullYear(), now.getMonth(), 12);
  if (target <= now) {
    // Already past the window — estimate next month
    target.setMonth(target.getMonth() + 1);
  }
  return target.toISOString().split("T")[0];
}

// ─── Animation variants ───────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const celebrationVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

const progressVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (progress: number) => ({
    scaleX: progress,
    transition: { duration: 0.8, ease: "easeOut" },
  }),
};

// ─── State config ─────────────────────────────────────────────

const stateConfig: Record<
  BulletinState,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    accent: string;
    bgAccent: string;
  }
> = {
  expected: {
    icon: CalendarClock,
    label: "Expected",
    accent: "text-calm-blue",
    bgAccent: "bg-calm-blue",
  },
  overdue: {
    icon: AlertTriangle,
    label: "Overdue",
    accent: "text-caution-amber",
    bgAccent: "bg-caution-amber",
  },
  available: {
    icon: PartyPopper,
    label: "Available",
    accent: "text-success-emerald",
    bgAccent: "bg-success-emerald",
  },
};

// ─── Component ─────────────────────────────────────────────────

export function BulletinCountdown({
  nextMonth,
  state,
  releaseDate,
  className,
}: BulletinCountdownProps) {
  const prefersReduced = useReducedMotion();
  const effectiveDate = releaseDate ?? estimateReleaseDate();
  const daysLeft = useMemo(() => daysUntil(effectiveDate), [effectiveDate]);
  const config = stateConfig[state];
  const Icon = config.icon;

  // Progress: assume a ~30-day cycle, clamped 0–1
  const progress = useMemo(() => {
    const total = 30;
    const elapsed = total - Math.max(0, daysLeft);
    return Math.min(1, Math.max(0, elapsed / total));
  }, [daysLeft]);

  const isApproaching = daysLeft >= 0 && daysLeft < 5 && state !== "available";

  // ── Available / celebration state ────────────────────────────
  if (state === "available") {
    return (
      <motion.div
        variants={prefersReduced ? undefined : celebrationVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-card)] bg-card p-[var(--spacing-card-padding)] ring-1 ring-foreground/10 shadow-[var(--shadow-card)]",
          className,
        )}
        role="status"
        aria-label={`${nextMonth} visa bulletin is available`}
      >
        {/* Emerald glow background */}
        <div className="absolute inset-0 bg-success-emerald/8 dark:bg-success-emerald/12" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-status-current">
            <PartyPopper
              className="size-5 text-status-current-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-semibold text-status-current-foreground">
              Bulletin Available!
            </p>
            <p className="text-body font-heading font-semibold text-card-foreground">
              {nextMonth}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Expected / overdue countdown state ──────────────────────
  return (
    <motion.div
      variants={prefersReduced ? undefined : cardVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] bg-card p-[var(--spacing-card-padding)] ring-1 ring-foreground/10 shadow-[var(--shadow-card)]",
        isApproaching && "ring-calm-blue/30 dark:ring-calm-blue/40",
        className,
      )}
      role="status"
      aria-label={`Next visa bulletin for ${nextMonth}: ${daysLeft > 0 ? `${daysLeft} days remaining` : "expected any day now"}`}
    >
      {/* Shimmer overlay when approaching */}
      {isApproaching && !prefersReduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-calm-blue/6 to-transparent dark:via-calm-blue/10"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            state === "overdue"
              ? "bg-status-near"
              : "bg-status-filing",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              state === "overdue"
                ? "text-status-near-foreground"
                : "text-status-filing-foreground",
            )}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-tiny font-medium text-muted-foreground">
            {nextMonth} Bulletin
          </p>
          <p className="text-body-lg font-heading font-semibold text-card-foreground">
            {daysLeft > 0 ? (
              <>
                <span className={config.accent}>{daysLeft}</span>{" "}
                {daysLeft === 1 ? "day" : "days"} away
              </>
            ) : daysLeft === 0 ? (
              <span className={config.accent}>Expected today</span>
            ) : (
              <span className="text-caution-amber">
                {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? "day" : "days"} overdue
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              "h-full origin-left rounded-full",
              config.bgAccent,
            )}
            variants={prefersReduced ? undefined : progressVariants}
            initial="hidden"
            animate="visible"
            custom={progress}
            style={prefersReduced ? { transform: `scaleX(${progress})` } : undefined}
          />
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-tiny text-muted-foreground">Released</span>
          <span className="text-tiny text-muted-foreground">
            {new Date(effectiveDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
