"use client";

import { ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type SourceType = "official" | "derived";

export interface SourceBadgeProps {
  /** "official" for USCIS/DOS sources, "derived" for app-computed data */
  source: SourceType;
  /** Optional override label */
  label?: string;
  className?: string;
}

// ─── Config ────────────────────────────────────────────────────

const sourceConfig: Record<
  SourceType,
  {
    defaultLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    classes: string;
  }
> = {
  official: {
    defaultLabel: "Official",
    icon: ShieldCheck,
    classes:
      "bg-status-filing text-status-filing-foreground",
  },
  derived: {
    defaultLabel: "App-derived",
    icon: Cpu,
    classes:
      "bg-status-flat text-status-flat-foreground",
  },
};

// ─── Component ─────────────────────────────────────────────────

export function SourceBadge({
  source,
  label: labelOverride,
  className,
}: SourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;
  const displayLabel = labelOverride ?? config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[999px] px-2.5 py-0.5 font-medium transition-colors",
        "text-tiny",
        config.classes,
        className,
      )}
      aria-label={`Data source: ${displayLabel}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
