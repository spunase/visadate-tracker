"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Calendar, TrendingUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { MovementChip } from "@/components/ui/movement-chip";
import { SourceBadge } from "@/components/ui/source-badge";
import { DistanceBar } from "@/components/track/distance-bar";
import type { EvaluationResult, DistanceBand, MovementResult } from "@/lib/rules-engine";
import type { VisaStatus } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ResultCardProps {
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

/** Map DistanceBand to a label and Tailwind color class */
const bandConfig: Record<DistanceBand, { label: string; colorClass: string }> = {
  far: { label: "Far", colorClass: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300" },
  approaching: { label: "Approaching", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  near: { label: "Near", colorClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  very_near: { label: "Very Near", colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  filing_current: { label: "Filing Current", colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  final_current: { label: "Current", colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
};



function movementToChipProps(
  movement: MovementResult | null,
): { label: string; direction: "advanced" | "retrogressed" | "flat" } {
  if (!movement) return { label: "No data", direction: "flat" };

  switch (movement.direction) {
    case "forward":
      return { label: `+${movement.days}d`, direction: "advanced" };
    case "retrogressed":
      return { label: `${movement.days}d`, direction: "retrogressed" };
    case "became_current":
      return { label: "Now current", direction: "advanced" };
    case "became_available":
      return { label: "Now available", direction: "advanced" };
    case "became_unavailable":
      return { label: "Now unavailable", direction: "retrogressed" };
    case "became_date":
      return { label: "Retrogressed", direction: "retrogressed" };
    case "no_change":
    default:
      return { label: "No change", direction: "flat" };
  }
}

function formatBulletinMonth(ym: string): string {
  // ym is like "2026-03"
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ResultCard({ evaluation, scenario, bulletinMonth }: ResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const { eligibility, movement, band, explanation } = evaluation;
  const faElig = eligibility.finalAction;
  const dfElig = eligibility.datesForFiling;
  const bandInfo = bandConfig[band];

  // Primary status displayed is Final Action status
  const primaryStatus: VisaStatus = faElig.state;

  const faMovement = movementToChipProps(movement.finalAction);
  const dfMovement = movementToChipProps(movement.datesForFiling);

  // Build a user-friendly primary verdict
  const primaryVerdict = primaryStatus === "current"
    ? `Your ${scenario.category} priority date is current.`
    : primaryStatus === "unavailable"
      ? `${scenario.category} is currently unavailable for ${scenario.country}.`
      : `Your ${scenario.category} priority date is not yet current.`;

  return (
    <Card className="riso-doc-teal rounded-[18px] border border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* ── Primary Status Header ── */}
        <div className="flex flex-col gap-3 border-b border-border/30 bg-muted/20 p-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={primaryStatus} />
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${bandInfo.colorClass}`}
            >
              {bandInfo.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {scenario.category}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {scenario.country}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {scenario.path === "AOS" ? "Adjustment of Status" : "Consular Processing"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">
            {primaryVerdict}
          </p>
          <p className="text-xs text-muted-foreground">
            Priority Date:{" "}
            {new Date(scenario.priorityDate + "T00:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}Final Action Cutoff: {explanation.compared.finalActionCutoff}
          </p>
        </div>

        {/* ── Final Action Summary (always visible) ── */}
        <div className="border-b border-border/30 p-5">
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {faElig.explanation}
          </p>
          <DistanceBar state={faElig.state} distanceDays={faElig.distanceDays} />
          {movement.finalAction && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">Movement this month</span>
              <MovementChip label={faMovement.label} direction={faMovement.direction} />
            </div>
          )}
        </div>

        {/* ── Detailed Breakdown (collapsed by default) ── */}
        <div className="border-b border-border/30">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Dates for Filing &amp; Full Details
            </span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dates for Filing */}
              <div className="border-t border-border/20 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Dates for Filing</h4>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={dfElig.state as VisaStatus} compact />
                  <span className="text-xs font-medium text-muted-foreground">
                    Cutoff: {explanation.compared.datesForFilingCutoff}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {dfElig.explanation}
                </p>
                <DistanceBar state={dfElig.state} distanceDays={dfElig.distanceDays} />
              </div>

              {/* Movement */}
              <div className="border-t border-border/20 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">Month-over-Month Movement</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Final Action</span>
                    <MovementChip label={faMovement.label} direction={faMovement.direction} />
                  </div>
                  {movement.finalAction && (
                    <p className="text-[11px] text-muted-foreground">{movement.finalAction.summary}</p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Dates for Filing</span>
                    <MovementChip label={dfMovement.label} direction={dfMovement.direction} />
                  </div>
                  {movement.datesForFiling && (
                    <p className="text-[11px] text-muted-foreground">{movement.datesForFiling.summary}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Explainability Section (collapsible) ── */}
        <div className="border-b border-border/30">
          <button
            onClick={() => setShowAudit(!showAudit)}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30"
          >
            <span className="text-xs font-semibold text-muted-foreground">
              How was this calculated?
            </span>
            {showAudit ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showAudit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 pb-5"
            >
              <div className="rounded-xl bg-muted/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
                <div className="mb-2">
                  <span className="font-semibold text-foreground">Compared: </span>
                  PD {explanation.compared.priorityDate} vs FA cutoff{" "}
                  {explanation.compared.finalActionCutoff}, DFF cutoff{" "}
                  {explanation.compared.datesForFilingCutoff}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-foreground">Source: </span>
                  {explanation.source}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-foreground">Calculation: </span>
                  {explanation.calculation}
                </div>
                <div>
                  <span className="font-semibold text-foreground">Result: </span>
                  {explanation.result}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Source attribution footer ── */}
        <div className="flex items-center justify-between p-5">
          <SourceBadge source="official" label="Visa Bulletin" />
          <span className="text-[11px] text-muted-foreground">
            Based on {formatBulletinMonth(bulletinMonth)} Visa Bulletin
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
