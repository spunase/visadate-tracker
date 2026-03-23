"use client";

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────

export interface NewsArticle {
  id: string;
  topic: string;
  title: string;
  summary: string;
  why_it_matters: string;
  source_url: string;
  publisher: string;
  published_at: string;
  source_type: "official" | "derived";
}

interface UseNewsResult {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────

export function useNews(): UseNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/news");
        if (!res.ok) {
          throw new Error(`Failed to fetch news (${res.status})`);
        }
        const data = await res.json();

        if (!cancelled) {
          setNews(data.news ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch news",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, []);

  return { news, isLoading, error };
}
