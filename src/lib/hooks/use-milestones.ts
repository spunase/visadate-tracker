"use client";

import { useState, useEffect } from "react";
import type { SavedTracker } from "@/stores/tracker-store";
import type { MilestoneBand } from "@/lib/content/types";
import { resolveBand } from "@/lib/rules-engine/milestones";

interface UseUserBandResult {
  band: MilestoneBand | null;
  isLoading: boolean;
}

/**
 * Determines the user's current milestone band by fetching the latest
 * bulletin data and calculating the distance between their priority date
 * and the relevant cutoff.
 *
 * Returns `null` for the band when there is no tracker or the bulletin
 * cannot be fetched.
 */
export function useUserBand(tracker: SavedTracker | null): UseUserBandResult {
  const [band, setBand] = useState<MilestoneBand | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tracker) {
      setBand(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function resolve() {
      try {
        const res = await fetch("/api/bulletin/current");
        if (!res.ok) {
          throw new Error(`Bulletin fetch failed (${res.status})`);
        }
        const data = await res.json();
        const cutoffRows: Array<{
          chart_type: string;
          category: string;
          country_bucket: string;
          cutoff_kind: string;
          cutoff_date: string | null;
          original_value: string;
        }> = data.cutoffRows ?? [];

        // Map tracker country to the country_bucket used in cutoff rows
        const countryBucket =
          tracker!.country === "India"
            ? "India"
            : tracker!.country === "China"
              ? "China"
              : tracker!.country === "Mexico"
                ? "Mexico"
                : tracker!.country === "Philippines"
                  ? "Philippines"
                  : "All Other";

        // Find the Final Action row for the user's category + country
        const faRow = cutoffRows.find(
          (r) =>
            r.chart_type === "final_action" &&
            r.category.toUpperCase() === tracker!.category.toUpperCase() &&
            r.country_bucket === countryBucket
        );

        if (!faRow) {
          if (!cancelled) setBand(null);
          return;
        }

        const originalVal = faRow.original_value?.trim().toUpperCase();

        let distanceDays: number | null = null;

        if (originalVal === "C") {
          // User is current
          distanceDays = null;
        } else if (originalVal === "U") {
          // Unavailable — treat as very far
          distanceDays = -9999;
        } else if (faRow.cutoff_date) {
          const cutoffDate = new Date(faRow.cutoff_date);
          const priorityDate = new Date(tracker!.priorityDate);
          distanceDays = Math.round(
            (priorityDate.getTime() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        const resolved = resolveBand(distanceDays, "final_action");

        if (!cancelled) {
          setBand(resolved);
        }
      } catch {
        if (!cancelled) {
          setBand(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [tracker?.id, tracker?.priorityDate, tracker?.category, tracker?.country]);

  return { band, isLoading };
}
