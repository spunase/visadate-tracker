"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────

export interface HistoryEntry {
  bulletinMonth: string;
  cutoffDate: string;
  originalValue: string;
  movementDays: number;
  movementDirection: "forward" | "backward" | "unchanged";
}

export interface HistoryFilters {
  category: string;
  country: string;
  chartType: string;
}

interface UseHistoryResult {
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────

function normalizeCountry(country: string): string {
  return country.toLowerCase().replace(/\s+/g, "_");
}

function normalizeChartType(chartMode: string): string {
  return chartMode.toLowerCase().replace(/\s+/g, "_");
}

// ─── Hook ──────────────────────────────────────────────────────

export function useHistory(
  category: string,
  country: string,
  chartType: string,
): UseHistoryResult {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchData();
    }, 150); // debounce selector changes

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          category,
          country: normalizeCountry(country),
          chart_type: normalizeChartType(chartType),
        });

        const res = await fetch(`/api/bulletin/history?${params}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch history (${res.status})`);
        }

        const data = await res.json();

        if (!cancelled) {
          const entries: HistoryEntry[] = (data.history ?? []).map(
            (h: Record<string, unknown>) => ({
              bulletinMonth: h.bulletin_month as string,
              cutoffDate: h.cutoff_date as string,
              originalValue: h.original_value as string,
              movementDays: h.movement_days as number,
              movementDirection: h.movement_direction as HistoryEntry["movementDirection"],
            }),
          );
          setHistory(entries);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch history data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, country, chartType, fetchKey]);

  return { history, isLoading, error, refetch };
}
