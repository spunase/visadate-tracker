"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type MovementDirection = "advanced" | "retrogressed" | "flat";

export interface MovementChipProps {
  /** e.g. "+45 days", "-2 months", "No change" */
  label: string;
  /** Determines color & icon. If omitted the component infers from label. */
  direction?: MovementDirection;
  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────

function inferDirection(label: string): MovementDirection {
  const trimmed = label.trim();
  if (trimmed.startsWith("+")) return "advanced";
  if (trimmed.startsWith("-")) return "retrogressed";
  return "flat";
}

const directionConfig: Record<
  MovementDirection,
  {
    icon: React.ComponentType<{ className?: string }>;
    classes: string;
    ariaPrefix: string;
  }
> = {
  advanced: {
    icon: ArrowUp,
    classes: "bg-status-current text-status-current-foreground",
    ariaPrefix: "Advanced",
  },
  retrogressed: {
    icon: ArrowDown,
    classes: "bg-status-retrogressed text-status-retrogressed-foreground",
    ariaPrefix: "Retrogressed",
  },
  flat: {
    icon: Minus,
    classes: "bg-status-flat text-status-flat-foreground",
    ariaPrefix: "No movement",
  },
};

// ─── Component ─────────────────────────────────────────────────

export function MovementChip({
  label,
  direction,
  className,
}: MovementChipProps) {
  const resolved = direction ?? inferDirection(label);
  const config = directionConfig[resolved];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[999px] px-2.5 py-0.5 font-medium transition-colors",
        "text-caption",
        config.classes,
        className,
      )}
      role="status"
      aria-label={`${config.ariaPrefix}: ${label}`}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
