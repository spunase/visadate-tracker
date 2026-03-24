"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, RefreshCw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatBulletinMonth,
  formatCutoffDate,
} from "@/lib/utils/format-date";
import type {
  VisaBulletin,
  PolicyUpdate,
  ValidationStatus,
  VisaCutoffRow,
} from "@/types/database";

// ─── Types ────────────────────────────────────────────────────

interface BulletinWithCount extends VisaBulletin {
  cutoff_count: number;
}

interface ApiMeta {
  source: string;
  generatedAt: string;
}

type TabId = "bulletins" | "freshness" | "diff";

// ─── Status Color Map ─────────────────────────────────────────

const STATUS_COLORS: Record<ValidationStatus, string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  validated: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  superseded: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
};

// ─── Freshness Helpers ────────────────────────────────────────

function getFreshnessStatus(expiresAt: string): "fresh" | "expiring" | "expired" {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffDays = (expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays < 7) return "expiring";
  return "fresh";
}

const FRESHNESS_COLORS = {
  fresh: "bg-emerald-500",
  expiring: "bg-amber-500",
  expired: "bg-red-500",
};

const FRESHNESS_LABELS = {
  fresh: "Fresh",
  expiring: "Expiring Soon",
  expired: "Expired",
};

// ─── Tab Button ───────────────────────────────────────────────

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onClick: (id: TabId) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Bulletin Review Tab ──────────────────────────────────────

function BulletinReviewTab({
  bulletins,
  loading,
}: {
  bulletins: BulletinWithCount[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (bulletins.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No bulletins found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="pb-2 pr-4">Month</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2 pr-4 text-right">Cutoff Rows</th>
            <th className="pb-2 pr-4">Published</th>
            <th className="pb-2 pr-4">Validated</th>
            <th className="pb-2">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {bulletins.map((b) => (
            <tr key={b.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-2.5 pr-4 font-medium">
                {formatBulletinMonth(b.bulletin_month)}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[b.validation_status]
                  }`}
                >
                  {b.validation_status}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-right tabular-nums">
                {b.cutoff_count}
              </td>
              <td className="py-2.5 pr-4 text-muted-foreground">
                {b.source_published_at
                  ? new Date(b.source_published_at).toLocaleDateString()
                  : "-"}
              </td>
              <td className="py-2.5 pr-4 text-muted-foreground">
                {b.validated_at
                  ? new Date(b.validated_at).toLocaleDateString()
                  : "-"}
              </td>
              <td className="py-2.5">
                {b.source_url ? (
                  <a
                    href={b.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="text-xs">View</span>
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Freshness Dashboard Tab ──────────────────────────────────

function FreshnessDashboardTab({
  updates,
  loading,
  onToggle,
}: {
  updates: PolicyUpdate[];
  loading: boolean;
  onToggle: (id: string, currentActive: boolean) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No policy updates found.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {updates.map((u) => {
        const freshness = getFreshnessStatus(u.freshness_expires_at);
        return (
          <div
            key={u.id}
            className={`flex items-center justify-between gap-3 rounded-[14px] border p-3 transition-colors ${
              u.is_active
                ? "border-border/50 bg-card"
                : "border-border/30 bg-muted/40 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Freshness dot */}
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${FRESHNESS_COLORS[freshness]}`}
                  title={FRESHNESS_LABELS[freshness]}
                />
                <span className="text-[10px] text-muted-foreground">
                  {FRESHNESS_LABELS[freshness]}
                </span>
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{u.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{u.publisher}</span>
                  <span className="text-border">|</span>
                  <span>
                    Expires:{" "}
                    {new Date(u.freshness_expires_at).toLocaleDateString()}
                  </span>
                  {u.source_type === "official" && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Official
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => onToggle(u.id, u.is_active)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                u.is_active
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {u.is_active ? "Active" : "Inactive"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Movement Diff Tab ────────────────────────────────────────

interface DiffRow {
  category: string;
  country_bucket: string;
  chart_type: string;
  currentDate: string | null;
  currentKind: string;
  previousDate: string | null;
  previousKind: string;
  change: "forward" | "backward" | "unchanged" | "new";
}

function buildDiffRows(
  currentRows: VisaCutoffRow[],
  previousRows: VisaCutoffRow[]
): DiffRow[] {
  const prevMap = new Map<string, VisaCutoffRow>();
  for (const r of previousRows) {
    prevMap.set(`${r.chart_type}|${r.category}|${r.country_bucket}`, r);
  }

  return currentRows.map((cur) => {
    const key = `${cur.chart_type}|${cur.category}|${cur.country_bucket}`;
    const prev = prevMap.get(key);

    let change: DiffRow["change"] = "unchanged";
    if (!prev) {
      change = "new";
    } else if (cur.cutoff_kind === "current" && prev.cutoff_kind !== "current") {
      change = "forward";
    } else if (cur.cutoff_kind !== "current" && prev.cutoff_kind === "current") {
      change = "backward";
    } else if (cur.cutoff_date && prev.cutoff_date) {
      const curTime = new Date(cur.cutoff_date).getTime();
      const prevTime = new Date(prev.cutoff_date).getTime();
      if (curTime > prevTime) change = "forward";
      else if (curTime < prevTime) change = "backward";
    }

    return {
      category: cur.category,
      country_bucket: cur.country_bucket,
      chart_type: cur.chart_type,
      currentDate: cur.cutoff_date,
      currentKind: cur.cutoff_kind,
      previousDate: prev?.cutoff_date ?? null,
      previousKind: prev?.cutoff_kind ?? "N/A",
      change,
    };
  });
}

const DIFF_COLORS = {
  forward: "bg-emerald-50 dark:bg-emerald-900/20",
  backward: "bg-red-50 dark:bg-red-900/20",
  unchanged: "",
  new: "bg-blue-50 dark:bg-blue-900/20",
};

const DIFF_INDICATORS = {
  forward: "text-emerald-600 dark:text-emerald-400",
  backward: "text-red-600 dark:text-red-400",
  unchanged: "text-gray-400 dark:text-gray-500",
  new: "text-blue-600 dark:text-blue-400",
};

function MovementDiffTab({
  bulletins,
  loading,
}: {
  bulletins: BulletinWithCount[];
  loading: boolean;
}) {
  const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
  const [diffLoading, setDiffLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [previousMonth, setPreviousMonth] = useState("");
  const [chartFilter, setChartFilter] = useState<"all" | "final_action" | "dates_for_filing">("final_action");

  useEffect(() => {
    if (bulletins.length < 2) return;

    const latest = bulletins[0];
    const prior = bulletins[1];
    setCurrentMonth(latest.bulletin_month);
    setPreviousMonth(prior.bulletin_month);

    async function fetchDiff() {
      setDiffLoading(true);
      try {
        // Fetch cutoff rows for both bulletins via the current API
        const [currentRes, previousRes] = await Promise.all([
          fetch(`/api/bulletin/current`),
          fetch(`/api/bulletin/current`), // In mock mode, same data; with Supabase we'd need a dedicated endpoint
        ]);

        // For a real implementation, we'd fetch by bulletin_id.
        // For now, use the current endpoint data and simulate the diff with mock.
        const currentData = await currentRes.json();
        const previousData = await previousRes.json();

        // Simulate a slight change for demo purposes in mock mode
        const currentCutoffs: VisaCutoffRow[] = currentData.cutoffRows ?? [];
        const previousCutoffs: VisaCutoffRow[] = previousData.cutoffRows?.map(
          (r: VisaCutoffRow) => {
            // Shift dates back 30 days to simulate prior month
            if (r.cutoff_date) {
              const d = new Date(r.cutoff_date);
              d.setDate(d.getDate() - 30);
              return { ...r, cutoff_date: d.toISOString().split("T")[0] };
            }
            return r;
          }
        ) ?? [];

        const rows = buildDiffRows(currentCutoffs, previousCutoffs);
        setDiffRows(rows);
      } catch (err) {
        console.error("Failed to fetch diff data:", err);
      } finally {
        setDiffLoading(false);
      }
    }

    fetchDiff();
  }, [bulletins]);

  if (loading || diffLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (bulletins.length < 2) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Need at least 2 bulletins for comparison.
      </p>
    );
  }

  const filteredRows =
    chartFilter === "all"
      ? diffRows
      : diffRows.filter((r) => r.chart_type === chartFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          Comparing{" "}
          <span className="font-medium text-foreground">
            {formatBulletinMonth(currentMonth)}
          </span>{" "}
          vs{" "}
          <span className="font-medium text-foreground">
            {formatBulletinMonth(previousMonth)}
          </span>
        </p>
        <div className="flex gap-1">
          {(
            [
              { id: "final_action", label: "Final Action" },
              { id: "dates_for_filing", label: "Filing" },
              { id: "all", label: "All" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setChartFilter(f.id)}
              className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                chartFilter === f.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="pb-2 pr-3">Category</th>
              <th className="pb-2 pr-3">Country</th>
              <th className="pb-2 pr-3">Chart</th>
              <th className="pb-2 pr-3 text-right">Previous</th>
              <th className="pb-2 pr-3 text-right">Current</th>
              <th className="pb-2 text-center">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredRows.map((row, i) => {
              const prevDisplay =
                row.previousKind === "current"
                  ? "Current"
                  : row.previousKind === "N/A"
                  ? "-"
                  : formatCutoffDate(row.previousDate);
              const curDisplay =
                row.currentKind === "current"
                  ? "Current"
                  : formatCutoffDate(row.currentDate);

              return (
                <tr
                  key={`${row.chart_type}-${row.category}-${row.country_bucket}`}
                  className={`transition-colors ${DIFF_COLORS[row.change]}`}
                >
                  <td className="py-2 pr-3 font-medium">{row.category}</td>
                  <td className="py-2 pr-3 text-muted-foreground capitalize">
                    {row.country_bucket.replace(/_/g, " ")}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">
                    {row.chart_type === "final_action"
                      ? "Final Action"
                      : "Filing"}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                    {prevDisplay}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums font-medium">
                    {curDisplay}
                  </td>
                  <td className="py-2 text-center">
                    <span
                      className={`text-xs font-medium ${DIFF_INDICATORS[row.change]}`}
                    >
                      {row.change === "forward"
                        ? "Advanced"
                        : row.change === "backward"
                        ? "Retrogressed"
                        : row.change === "new"
                        ? "New"
                        : "No Change"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Advanced
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          Retrogressed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
          No Change
        </span>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<TabId>("bulletins");
  const [bulletins, setBulletins] = useState<BulletinWithCount[]>([]);
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [bulletinLoading, setBulletinLoading] = useState(true);
  const [freshnessLoading, setFreshnessLoading] = useState(true);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  // Fetch bulletins
  const fetchBulletins = useCallback(async () => {
    setBulletinLoading(true);
    try {
      const res = await fetch("/api/admin/bulletins");
      const data = await res.json();
      setBulletins(data.bulletins ?? []);
      setMeta(data._meta);
    } catch (err) {
      console.error("Failed to fetch bulletins:", err);
    } finally {
      setBulletinLoading(false);
    }
  }, []);

  // Fetch freshness
  const fetchFreshness = useCallback(async () => {
    setFreshnessLoading(true);
    try {
      const res = await fetch("/api/admin/freshness");
      const data = await res.json();
      setUpdates(data.updates ?? []);
    } catch (err) {
      console.error("Failed to fetch freshness:", err);
    } finally {
      setFreshnessLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBulletins();
    fetchFreshness();
  }, [fetchBulletins, fetchFreshness]);

  // Toggle is_active
  const handleToggle = async (id: string, currentActive: boolean) => {
    // Optimistic update
    setUpdates((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, is_active: !currentActive } : u
      )
    );

    try {
      const res = await fetch("/api/admin/toggle-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentActive }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setUpdates((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, is_active: currentActive } : u
          )
        );
      }
    } catch {
      // Revert on error
      setUpdates((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: currentActive } : u
        )
      );
    }
  };

  // Summary stats
  const publishedCount = bulletins.filter(
    (b) => b.validation_status === "published"
  ).length;
  const activeUpdates = updates.filter((u) => u.is_active).length;
  const expiredUpdates = updates.filter(
    (u) => getFreshnessStatus(u.freshness_expires_at) === "expired"
  ).length;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Admin Console
            </h1>
            <p className="text-xs text-muted-foreground">
              Internal validation and content management
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchBulletins();
            fetchFreshness();
          }}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {bulletins.length}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total Bulletins
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {activeUpdates}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Active Updates
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardContent className="p-3 text-center">
              <p
                className={`text-2xl font-bold tabular-nums ${
                  expiredUpdates > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {expiredUpdates}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Expired Content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data source indicator */}
        {meta && (
          <p className="text-[10px] text-muted-foreground text-right">
            Data source: <span className="font-medium">{meta.source}</span>
            {" | "}
            {new Date(meta.generatedAt).toLocaleTimeString()}
          </p>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          <TabButton
            id="bulletins"
            label="Bulletin Review"
            active={activeTab === "bulletins"}
            onClick={setActiveTab}
          />
          <TabButton
            id="freshness"
            label="Freshness Dashboard"
            active={activeTab === "freshness"}
            onClick={setActiveTab}
          />
          <TabButton
            id="diff"
            label="Movement Diff"
            active={activeTab === "diff"}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {activeTab === "bulletins"
                ? "Visa Bulletins"
                : activeTab === "freshness"
                ? "Content Freshness"
                : "Month-over-Month Diff"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "bulletins" && (
              <BulletinReviewTab
                bulletins={bulletins}
                loading={bulletinLoading}
              />
            )}
            {activeTab === "freshness" && (
              <FreshnessDashboardTab
                updates={updates}
                loading={freshnessLoading}
                onToggle={handleToggle}
              />
            )}
            {activeTab === "diff" && (
              <MovementDiffTab
                bulletins={bulletins}
                loading={bulletinLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
