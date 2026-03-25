"use client";

import { useState, useEffect } from "react";
import type { HistoryEntry } from "./use-history";

// ─── Types ─────────────────────────────────────────────────────

export interface ConvergenceData {
  finalActionHistory: HistoryEntry[];
  filingHistory: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────

function normalizeCountry(country: string): string {
  return country.toLowerCase().replace(/\s+/g, "_");
}

// ─── Hook ──────────────────────────────────────────────────────

/**
 * Fetches both Final Action and Filing history in parallel
 * for use in the Convergence Timeline visualization.
 */
export function useConvergence(
  category: string,
  country: string,
): ConvergenceData {
  const [finalActionHistory, setFinalActionHistory] = useState<HistoryEntry[]>(
    [],
  );
  const [filingHistory, setFilingHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchBoth();
    }, 150);

    async function fetchBoth() {
      setIsLoading(true);
      setError(null);

      try {
        const base = "/api/bulletin/history";
        const countryKey = normalizeCountry(country);

        const [faRes, dfRes] = await Promise.all([
          fetch(
            `${base}?category=${category}&country=${countryKey}&chart_type=final_action`,
          ),
          fetch(
            `${base}?category=${category}&country=${countryKey}&chart_type=dates_for_filing`,
          ),
        ]);

        if (!faRes.ok) throw new Error(`Failed to fetch FA history (${faRes.status})`);
        if (!dfRes.ok) throw new Error(`Failed to fetch Filing history (${dfRes.status})`);

        const [faData, dfData] = await Promise.all([faRes.json(), dfRes.json()]);

        if (!cancelled) {
          const mapEntries = (raw: Record<string, unknown>[]): HistoryEntry[] =>
            raw.map((h) => ({
              bulletinMonth: h.bulletin_month as string,
              cutoffDate: h.cutoff_date as string,
              originalValue: h.original_value as string,
              movementDays: h.movement_days as number,
              movementDirection: h.movement_direction as HistoryEntry["movementDirection"],
            }));

          setFinalActionHistory(mapEntries(faData.history ?? []));
          setFilingHistory(mapEntries(dfData.history ?? []));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch convergence data",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, country]);

  return { finalActionHistory, filingHistory, isLoading, error };
}
