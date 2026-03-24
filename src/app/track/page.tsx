"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultCard } from "@/components/track/result-card";
import { ShareSnapshot } from "@/components/track/share-snapshot";
import { useTrackerStore, type SavedTracker } from "@/stores/tracker-store";
import { evaluateScenario } from "@/lib/rules-engine";
import type {
  EvaluationInput,
  EvaluationResult,
  CutoffValue,
} from "@/lib/rules-engine";
import type { VisaCutoffRow } from "@/types/database";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const categories = ["EB1", "EB2", "EB3"] as const;
const countries = ["India", "China", "Mexico", "Philippines", "All Other"] as const;
const paths = ["AOS", "CP"] as const;

/** Map display country names to the API's country_bucket values */
const countryToApiKey: Record<string, string> = {
  India: "india",
  China: "china_mainland",
  Mexico: "mexico",
  Philippines: "philippines",
  "All Other": "all_other",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a cutoff row to a CutoffValue understood by the rules engine */
function rowToCutoffValue(row: VisaCutoffRow | undefined): CutoffValue {
  if (!row) return "U";
  if (row.cutoff_kind === "current") return "C";
  if (row.cutoff_kind === "unavailable") return "U";
  if (row.cutoff_date) return new Date(row.cutoff_date + "T00:00:00");
  return "U";
}

/** Find a cutoff row matching a given chart_type, category, and country_bucket */
function findRow(
  rows: VisaCutoffRow[],
  chartType: string,
  category: string,
  countryBucket: string,
): VisaCutoffRow | undefined {
  return rows.find(
    (r) =>
      r.chart_type === chartType &&
      r.category === category &&
      r.country_bucket === countryBucket,
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function TrackPage() {
  const [category, setCategory] = useState<SavedTracker["category"]>("EB2");
  const [country, setCountry] = useState<SavedTracker["country"]>("India");
  const [priorityDate, setPriorityDate] = useState("");
  const [path, setPath] = useState<SavedTracker["path"]>("AOS");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [bulletinMonth, setBulletinMonth] = useState<string>("");

  const { savedTrackers, addTracker, removeTracker } = useTrackerStore();

  // ── Check Status handler ──────────────────────────────────────────────
  const handleCheck = useCallback(async () => {
    if (!priorityDate) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Fetch current bulletin data
      const res = await fetch("/api/bulletin/current");
      if (!res.ok) {
        throw new Error(`Failed to fetch bulletin data (${res.status})`);
      }
      const data = await res.json();
      const rows: VisaCutoffRow[] = data.cutoffRows;
      const month: string = data.bulletin?.bulletin_month ?? "";

      // 2. Find matching cutoff rows
      const apiCountry = countryToApiKey[country] ?? "all_other";

      const faRow = findRow(rows, "final_action", category, apiCountry);
      const dfRow = findRow(rows, "dates_for_filing", category, apiCountry);

      const finalActionCutoff = rowToCutoffValue(faRow);
      const datesForFilingCutoff = rowToCutoffValue(dfRow);

      // 3. Build evaluation input
      const input: EvaluationInput = {
        priorityDate: new Date(priorityDate + "T00:00:00"),
        category,
        country,
        finalActionCutoff,
        datesForFilingCutoff,
        bulletinMonth: month,
        path,
      };

      // 4. Run evaluation (pure function, client-side)
      const evaluation = evaluateScenario(input);

      setResult(evaluation);
      setBulletinMonth(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [priorityDate, category, country, path]);

  // ── Reset result when form changes ────────────────────────────────────
  const resetResult = () => {
    setResult(null);
    setError(null);
  };

  // ── Save handler ──────────────────────────────────────────────────────
  const handleSave = () => {
    if (!priorityDate) return;
    addTracker({
      category,
      country,
      priorityDate,
      path,
      label: `${category} ${country}`,
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Track"
        subtitle="Check your priority date status"
      />

      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* ── Input Form ── */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Category */}
            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </legend>
              <div className="flex gap-2" role="radiogroup" aria-label="Category">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCategory(c);
                      resetResult();
                    }}
                    role="radio"
                    aria-checked={category === c}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                      category === c
                        ? "bg-[#2F6BFF] text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Country */}
            <div>
              <label htmlFor="country-select" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Country of Chargeability
              </label>
              <select
                id="country-select"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value as SavedTracker["country"]);
                  resetResult();
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20 focus-visible:ring-2 focus-visible:ring-[#2F6BFF]"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Date */}
            <div>
              <label htmlFor="priority-date-input" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority Date
              </label>
              <input
                id="priority-date-input"
                type="date"
                value={priorityDate}
                onChange={(e) => {
                  setPriorityDate(e.target.value);
                  resetResult();
                }}
                aria-describedby="priority-date-hint"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20 focus-visible:ring-2 focus-visible:ring-[#2F6BFF]"
              />
              <p id="priority-date-hint" className="mt-1 text-[11px] text-foreground/60 dark:text-foreground/50">
                The date from your I-140 approval or labor certification.
              </p>
            </div>

            {/* Path */}
            <fieldset>
              <legend className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Processing Path
              </legend>
              <div className="flex gap-2" role="radiogroup" aria-label="Processing Path">
                {paths.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPath(p);
                      resetResult();
                    }}
                    role="radio"
                    aria-checked={path === p}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                      path === p
                        ? "bg-[#2F6BFF] text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {p === "AOS" ? "Adjustment of Status" : "Consular Processing"}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Check Button */}
            <Button
              onClick={handleCheck}
              disabled={!priorityDate || loading}
              className="mt-1 w-full rounded-xl bg-[#2F6BFF] py-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#254FCC] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </span>
              ) : (
                "Check Status"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Error State ── */}
        <div role="alert">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <Card className="rounded-[18px] border border-rose-200 bg-rose-50/50 shadow-sm dark:border-rose-800 dark:bg-rose-950/20">
                  <CardContent className="p-5">
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                      {error}
                    </p>
                    <p className="mt-1 text-xs text-rose-600/70 dark:text-rose-400/70">
                      Please try again. If the problem persists, the bulletin data may be
                      temporarily unavailable.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Result Card ── */}
        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <ResultCard
                  evaluation={result}
                  scenario={{
                    category,
                    country,
                    priorityDate,
                    path,
                  }}
                  bulletinMonth={bulletinMonth}
                />

                {/* Save button below the result card */}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    className="gap-1.5 rounded-lg text-xs focus-visible:ring-2 focus-visible:ring-[#2F6BFF]"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    Save Tracker
                  </Button>
                </div>

                {/* Share Snapshot */}
                <div className="mt-4">
                  <ShareSnapshot
                    evaluation={result}
                    scenario={{
                      category,
                      country,
                      priorityDate,
                      path,
                    }}
                    bulletinMonth={bulletinMonth}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Saved Trackers ── */}
        {savedTrackers.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Trackers
            </h3>
            <div className="flex flex-col gap-2">
              {savedTrackers.map((tracker) => (
                <motion.div
                  key={tracker.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                >
                  <Card className="rounded-[18px] border border-border/50 shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {tracker.category}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {tracker.country}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {tracker.path}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          PD:{" "}
                          {new Date(tracker.priorityDate + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTracker(tracker.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2"
                        aria-label="Remove tracker"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
