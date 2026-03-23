"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────

export interface Bulletin {
  id: string;
  bulletin_month: string;
  source_url: string;
  source_published_at: string;
  validation_status: string;
}

export interface CutoffRow {
  chart_type: string;
  category: string;
  country_bucket: string;
  cutoff_kind: string;
  cutoff_date: string | null;
  original_value: string;
}

interface UseBulletinResult {
  bulletin: Bulletin | null;
  cutoffRows: CutoffRow[];
  isLoading: boolean;
  error: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────

export function useBulletin(): UseBulletinResult {
  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [cutoffRows, setCutoffRows] = useState<CutoffRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBulletin() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/bulletin/current");
        if (!res.ok) {
          throw new Error(`Failed to fetch bulletin (${res.status})`);
        }
        const data = await res.json();

        if (!cancelled) {
          setBulletin(data.bulletin);
          setCutoffRows(data.cutoffRows ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch bulletin data",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchBulletin();
    return () => {
      cancelled = true;
    };
  }, []);

  return { bulletin, cutoffRows, isLoading, error };
}
