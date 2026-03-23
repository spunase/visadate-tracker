"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StatusState } from "@/lib/rules-engine";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DistanceBarProps {
  /** Eligibility state for this chart */
  state: StatusState;
  /** Distance in days (negative = behind cutoff, positive = current). null for C/U. */
  distanceDays: number | null;
  /** Max distance to use for scaling the bar (default 3650 = ~10 years) */
  maxDays?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeFillPercent(
  state: StatusState,
  distanceDays: number | null,
  maxDays: number,
): number {
  if (state === "current" || state === "filing_current") return 100;
  if (state === "unavailable") return 0;
  if (distanceDays === null) return 0;

  // distanceDays is negative when behind; convert to positive behind-days
  const behind = Math.abs(distanceDays);
  const pct = Math.max(0, Math.min(100, ((maxDays - behind) / maxDays) * 100));
  return pct;
}

function formatDistance(state: StatusState, distanceDays: number | null): string {
  if (state === "current") return "Current!";
  if (state === "filing_current") return "Filing Current";
  if (state === "unavailable") return "Unavailable";
  if (distanceDays === null) return "";

  const behind = Math.abs(distanceDays);
  if (behind >= 365) {
    const years = Math.floor(behind / 365);
    const months = Math.round((behind % 365) / 30.44);
    if (months === 0) return `${years}y behind`;
    return `${years}y ${months}m behind`;
  }
  if (behind >= 30) {
    const months = Math.round(behind / 30.44);
    return `~${months}m behind`;
  }
  return `${behind}d behind`;
}

// ---------------------------------------------------------------------------
// Color config by state
// ---------------------------------------------------------------------------

function barColor(state: StatusState): string {
  switch (state) {
    case "current":
      return "bg-emerald-500";
    case "filing_current":
      return "bg-[#2F6BFF]";
    case "not_current":
      return "bg-amber-500";
    case "retrogressed":
      return "bg-rose-500";
    case "unavailable":
      return "bg-zinc-300 dark:bg-zinc-700";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DistanceBar({
  state,
  distanceDays,
  maxDays = 3650,
  className,
}: DistanceBarProps) {
  const fillPct = computeFillPercent(state, distanceDays, maxDays);
  const label = formatDistance(state, distanceDays);
  const isCurrent = state === "current" || state === "filing_current";
  const isUnavailable = state === "unavailable";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Labels row */}
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Your PD</span>
        <span>Cutoff</span>
      </div>

      {/* Bar track */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        {isUnavailable ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Unavailable
            </span>
          </div>
        ) : (
          <motion.div
            className={cn("absolute inset-y-0 left-0 rounded-full", barColor(state))}
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        )}

        {/* Current overlay badge */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <span className="text-[10px] font-bold text-white drop-shadow-sm">
              {state === "current" ? "Current!" : "Filing Current"}
            </span>
          </motion.div>
        )}
      </div>

      {/* Distance text */}
      {!isCurrent && !isUnavailable && (
        <p className="text-center text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
