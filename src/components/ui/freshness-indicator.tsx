"use client";

import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type FreshnessLevel = "fresh" | "recent" | "stale";

export interface FreshnessIndicatorProps {
  /** The date the data was last updated */
  updatedAt: Date;
  /** Override the auto-calculated freshness level */
  level?: FreshnessLevel;
  /** Number of days after which data is considered "stale" (default 7) */
  staleAfterDays?: number;
  /** Number of days considered "fresh" (default 1) */
  freshWithinDays?: number;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function computeLevel(
  updatedAt: Date,
  freshWithin: number,
  staleAfter: number,
): FreshnessLevel {
  const days = daysBetween(new Date(), updatedAt);
  if (days <= freshWithin) return "fresh";
  if (days <= staleAfter) return "recent";
  return "stale";
}

function formatRelativeTime(updatedAt: Date): string {
  const now = new Date();
  const days = daysBetween(now, updatedAt);

  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }
  const months = Math.floor(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

// ─── Config ────────────────────────────────────────────────────

const levelConfig: Record<
  FreshnessLevel,
  {
    icon: React.ComponentType<{ className?: string }>;
    classes: string;
  }
> = {
  fresh: {
    icon: CheckCircle2,
    classes: "text-status-current-foreground",
  },
  recent: {
    icon: Clock,
    classes: "text-status-flat-foreground",
  },
  stale: {
    icon: AlertTriangle,
    classes: "text-status-near-foreground",
  },
};

// ─── Component ─────────────────────────────────────────────────

export function FreshnessIndicator({
  updatedAt,
  level: levelOverride,
  staleAfterDays = 7,
  freshWithinDays = 1,
  className,
}: FreshnessIndicatorProps) {
  const level =
    levelOverride ?? computeLevel(updatedAt, freshWithinDays, staleAfterDays);
  const config = levelConfig[level];
  const Icon = config.icon;
  const relativeText = formatRelativeTime(updatedAt);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-tiny font-medium transition-colors",
        config.classes,
        className,
      )}
      role="status"
      aria-label={`Data freshness: ${relativeText}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span>{relativeText}</span>
      {level === "stale" && (
        <span className="sr-only"> (data may be outdated)</span>
      )}
    </span>
  );
}
