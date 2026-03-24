"use client";

import { forwardRef } from "react";
import type { EvaluationResult } from "@/lib/rules-engine";
import type { VisaStatus } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SnapshotCardProps {
  evaluation: EvaluationResult;
  scenario: {
    category: string;
    country: string;
    priorityDate: string;
    path: string;
  };
  bulletinMonth: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPriorityDate(pd: string): string {
  return new Date(pd + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatBulletinMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function statusLabel(state: VisaStatus): string {
  switch (state) {
    case "current":
      return "Current";
    case "filing_current":
      return "Filing Current";
    case "not_current":
      return "Not Current";
    case "retrogressed":
      return "Retrogressed";
    case "unavailable":
      return "Unavailable";
  }
}

function statusDotColor(state: VisaStatus): string {
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
      return "bg-zinc-400";
  }
}

function formatDistance(distanceDays: number | null): string {
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

function movementLabel(movement: EvaluationResult["movement"]["finalAction"]): string {
  if (!movement) return "No data";
  switch (movement.direction) {
    case "forward":
      return `+${movement.days} days forward`;
    case "retrogressed":
      return `${movement.days} days back`;
    case "became_current":
      return "Now current";
    case "became_available":
      return "Now available";
    case "became_unavailable":
      return "Now unavailable";
    case "became_date":
      return "Retrogressed from current";
    case "no_change":
    default:
      return "No change";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SnapshotCard = forwardRef<HTMLDivElement, SnapshotCardProps>(
  function SnapshotCard({ evaluation, scenario, bulletinMonth }, ref) {
    const faElig = evaluation.eligibility.finalAction;
    const dfElig = evaluation.eligibility.datesForFiling;
    const faStatus = faElig.state as VisaStatus;
    const dfStatus = dfElig.state as VisaStatus;
    const faMovement = evaluation.movement.finalAction;

    return (
      <div
        ref={ref}
        className="w-full max-w-md overflow-hidden rounded-[18px] border border-border/50 bg-background shadow-lg"
        style={{ fontFamily: '"SF Pro", "Inter", system-ui, sans-serif' }}
      >
        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-r from-[#2F6BFF] to-[#5B8CFF] px-5 py-4">
          <h3 className="text-base font-bold tracking-tight text-white">
            VisaDateTracker
          </h3>
          <p className="mt-0.5 text-[11px] font-medium text-white/70">
            {formatBulletinMonth(bulletinMonth)} Visa Bulletin
          </p>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-3.5 p-5">
          {/* Category / Country / Path badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-full bg-[#2F6BFF]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2F6BFF]">
              {scenario.category}
            </span>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
              {scenario.country}
            </span>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-foreground/70">
              {scenario.path === "AOS" ? "AOS" : "CP"}
            </span>
          </div>

          {/* Priority Date */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Priority Date
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatPriorityDate(scenario.priorityDate)}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Final Action Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Final Action
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusDotColor(faStatus)}`} />
                <span className="text-sm font-semibold text-foreground">
                  {statusLabel(faStatus)}
                </span>
              </div>
            </div>
            {faElig.distanceDays !== null && faStatus !== "current" && (
              <span className="text-xs font-medium text-muted-foreground">
                {formatDistance(faElig.distanceDays)}
              </span>
            )}
          </div>

          {/* Filing Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dates for Filing
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusDotColor(dfStatus)}`} />
                <span className="text-sm font-semibold text-foreground">
                  {statusLabel(dfStatus)}
                </span>
              </div>
            </div>
            {dfElig.distanceDays !== null && dfStatus !== "current" && dfStatus !== "filing_current" && (
              <span className="text-xs font-medium text-muted-foreground">
                {formatDistance(dfElig.distanceDays)}
              </span>
            )}
          </div>

          {/* Movement */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Movement This Month
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {movementLabel(faMovement)}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Disclaimer + URL */}
          <div className="flex items-end justify-between">
            <p className="max-w-[240px] text-[9px] leading-tight text-muted-foreground/60">
              Informational only. Verify with official sources.
            </p>
            <p className="text-[10px] font-medium text-[#2F6BFF]">
              visadate-tracker.netlify.app
            </p>
          </div>
        </div>
      </div>
    );
  },
);
