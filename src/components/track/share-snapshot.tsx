"use client";

import { useRef, useState, useCallback } from "react";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnapshotCard } from "@/components/track/snapshot-card";
import type { EvaluationResult } from "@/lib/rules-engine";
import type { VisaStatus } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ShareSnapshotProps {
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
// Helpers — plain text summary
// ---------------------------------------------------------------------------

function formatPriorityDateShort(pd: string): string {
  return new Date(pd + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
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

function distanceText(distanceDays: number | null): string {
  if (distanceDays === null) return "";
  const behind = Math.abs(distanceDays);
  return ` (${behind} days behind)`;
}

function movementText(movement: EvaluationResult["movement"]["finalAction"]): string {
  if (!movement) return "No data";
  switch (movement.direction) {
    case "forward":
      return `+${movement.days} days forward this month`;
    case "retrogressed":
      return `${movement.days} days back this month`;
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
      return "No change this month";
  }
}

function buildPlainText(
  evaluation: EvaluationResult,
  scenario: ShareSnapshotProps["scenario"],
  bulletinMonth: string,
): string {
  const fa = evaluation.eligibility.finalAction;
  const df = evaluation.eligibility.datesForFiling;
  const faState = fa.state as VisaStatus;
  const dfState = df.state as VisaStatus;

  const lines = [
    `VisaDateTracker Status \u2014 ${formatBulletinMonth(bulletinMonth)}`,
    `${scenario.category} ${scenario.country} (${scenario.path})`,
    `Priority Date: ${formatPriorityDateShort(scenario.priorityDate)}`,
    `Final Action: ${statusLabel(faState)}${faState !== "current" ? distanceText(fa.distanceDays) : ""}`,
    `Filing: ${statusLabel(dfState)}`,
    `Movement: ${movementText(evaluation.movement.finalAction)}`,
    `\u2014`,
    `visadate-tracker.netlify.app`,
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShareSnapshot({ evaluation, scenario, bulletinMonth }: ShareSnapshotProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // ── Copy Summary ────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    const text = buildPlainText(evaluation, scenario, bulletinMonth);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [evaluation, scenario, bulletinMonth]);

  // ── Share Image ─────────────────────────────────────────────────────────
  const handleShareImage = useCallback(async () => {
    const card = cardRef.current;
    if (!card) return;

    setCapturing(true);
    try {
      // Dynamically import html-to-image (lightweight, ~3KB gzipped)
      // Falls back to a simple approach if not available
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(card, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Trigger download
      const link = document.createElement("a");
      link.download = `visadate-status-${scenario.category}-${scenario.country}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback: try canvas-based approach
      try {
        const { toBlob } = await import("html-to-image");
        const blob = await toBlob(card, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `visadate-status-${scenario.category}-${scenario.country}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        // Ultimate fallback: alert user
        alert(
          "Image export is not supported in this browser. Please use a screenshot tool instead.",
        );
      }
    } finally {
      setCapturing(false);
    }
  }, [scenario.category, scenario.country]);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Snapshot Card (visible, used as capture target) ── */}
      <SnapshotCard
        ref={cardRef}
        evaluation={evaluation}
        scenario={scenario}
        bulletinMonth={bulletinMonth}
      />

      {/* ── Action Buttons ── */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 gap-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2F6BFF]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy Summary
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareImage}
          disabled={capturing}
          className="flex-1 gap-1.5 rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2F6BFF]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          {capturing ? "Capturing..." : "Share Image"}
        </Button>
      </div>
    </div>
  );
}
