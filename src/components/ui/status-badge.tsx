"use client";

import {
  CheckCircle2,
  FileCheck2,
  Clock,
  TrendingDown,
  MinusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisaStatus } from "@/lib/design-tokens";

// ─── Config ────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

const statusConfig: Record<VisaStatus, StatusConfig> = {
  current: {
    label: "Current",
    icon: CheckCircle2,
    classes:
      "bg-status-current text-status-current-foreground",
  },
  filing_current: {
    label: "Filing Current",
    icon: FileCheck2,
    classes:
      "bg-status-filing text-status-filing-foreground",
  },
  not_current: {
    label: "Not Current",
    icon: Clock,
    classes:
      "bg-status-near text-status-near-foreground",
  },
  retrogressed: {
    label: "Retrogressed",
    icon: TrendingDown,
    classes:
      "bg-status-retrogressed text-status-retrogressed-foreground",
  },
  unavailable: {
    label: "Unavailable",
    icon: MinusCircle,
    classes:
      "bg-status-flat text-status-flat-foreground",
  },
};

// ─── Component ─────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: VisaStatus;
  /** Override the default label text */
  label?: string;
  /** Render a compact version (icon only with sr-only text) */
  compact?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label: labelOverride,
  compact = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = labelOverride ?? config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[999px] font-medium transition-colors",
        "text-caption",
        compact ? "px-2 py-0.5" : "px-3 py-1",
        config.classes,
        className,
      )}
      role="status"
      aria-label={displayLabel}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {compact ? (
        <span className="sr-only">{displayLabel}</span>
      ) : (
        <span>{displayLabel}</span>
      )}
    </span>
  );
}
