"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Loader2, Lock, Pencil } from "lucide-react";
import {
  usePreferencesStore,
  CATEGORY_GROUPS,
  type PreferredCategory,
  type CategoryGroup,
} from "@/stores/preferences-store";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultCard } from "@/components/track/result-card";
import { ShareSnapshot } from "@/components/track/share-snapshot";
import { useTrackerStore, type SavedTracker } from "@/stores/tracker-store";
import { useAuthStore } from "@/stores/auth-store";
import { SignInDialog } from "@/components/auth/sign-in-dialog";
import { JourneyProgress } from "@/components/ui/journey-progress";
import { ConvergenceTimeline } from "@/components/charts/convergence-timeline";
import { useConvergence } from "@/lib/hooks/use-convergence";
import { EmptyState } from "@/components/ui/empty-state";
import { JourneySnapshot } from "@/components/ui/journey-snapshot";
import { evaluateScenario } from "@/lib/rules-engine";
import type {
  EvaluationInput,
  EvaluationResult,
  CutoffValue,
} from "@/lib/rules-engine";
import type { VisaCutoffRow } from "@/types/database";
import { CountryFlagSelector } from "@/components/ui/country-flag-selector";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const countries = ["India", "China", "Mexico", "Philippines", "All Other"] as const;
const paths = ["AOS", "CP"] as const;

const ebCategories = ["EB1", "EB2", "EB3"] as const;

function groupForCategory(cat: string): CategoryGroup {
  return (ebCategories as readonly string[]).includes(cat) ? "Employment" : "Family";
}

function categoriesForGroup(group: CategoryGroup) {
  return CATEGORY_GROUPS.find((g) => g.label === group)!.categories;
}

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
  const { defaultCountry, defaultCategory, defaultPath } = usePreferencesStore();

  const [activeGroup, setActiveGroup] = useState<CategoryGroup>(groupForCategory(defaultCategory));
  const [category, setCategory] = useState<SavedTracker["category"]>(defaultCategory);
  const [country, setCountry] = useState<SavedTracker["country"]>(defaultCountry);
  const [priorityDate, setPriorityDate] = useState("");
  const [path, setPath] = useState<SavedTracker["path"]>(defaultPath);

  const visibleCategories = categoriesForGroup(activeGroup);

  // ── Reset result when form changes ────────────────────────────────────
  const resetResult = () => {
    setResult(null);
    setError(null);
    setActiveTrackerId(null);
  };

  const handleGroupChange = (group: CategoryGroup) => {
    setActiveGroup(group);
    setCategory(categoriesForGroup(group)[0]);
    resetResult();
  };

  // Sync with preferences on hydration
  useEffect(() => {
    const prefs = usePreferencesStore.getState();
    setActiveGroup(groupForCategory(prefs.defaultCategory));
    setCategory(prefs.defaultCategory);
    setCountry(prefs.defaultCountry);
    setPath(prefs.defaultPath);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [bulletinMonth, setBulletinMonth] = useState<string>("");
  const [faCutoffDate, setFaCutoffDate] = useState<string | null>(null);
  const [filingCutoffDate, setFilingCutoffDate] = useState<string | null>(null);

  const { savedTrackers, addTracker, removeTracker } = useTrackerStore();
  const { user } = useAuthStore();
  const [showSignIn, setShowSignIn] = useState(false);
  const [activeTrackerId, setActiveTrackerId] = useState<string | null>(null);
  const pendingAutoCheck = useRef(false);

  // Fetch convergence data (both FA + Filing histories) when result is shown
  const convergence = useConvergence(category, country);

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

      // Store cutoff dates for display in JourneyProgress/Snapshot
      setFaCutoffDate(faRow?.cutoff_date ?? null);
      setFilingCutoffDate(dfRow?.cutoff_date ?? null);

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

  // ── Load saved tracker into form and auto-check ─────────────────────
  const loadTracker = useCallback((tracker: SavedTracker) => {
    const grp = groupForCategory(tracker.category);
    setActiveGroup(grp);
    setCategory(tracker.category);
    setCountry(tracker.country);
    setPriorityDate(tracker.priorityDate);
    setPath(tracker.path);
    setActiveTrackerId(tracker.id);
    setResult(null);
    setError(null);
    pendingAutoCheck.current = true;
  }, []);

  // Auto-trigger check after a tracker is loaded and state has settled
  useEffect(() => {
    if (pendingAutoCheck.current && priorityDate) {
      pendingAutoCheck.current = false;
      handleCheck();
    }
  }, [priorityDate, category, country, path, handleCheck]);

  // ── Save handler ──────────────────────────────────────────────────────
  const handleSave = () => {
    if (!priorityDate) return;
    if (!user) {
      setShowSignIn(true);
      return;
    }
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
        <Card className="riso-doc-gold rounded-[18px] border border-border/50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Visa Type (Employment / Family) */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visa Type
                {result && (
                  <span className="inline-flex items-center gap-1 text-[10px] normal-case font-medium text-muted-foreground/70">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    <button
                      onClick={() => { resetResult(); }}
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Change
                    </button>
                  </span>
                )}
              </label>
              <div
                className={`inline-flex rounded-xl bg-muted p-1 shadow-inner ${result ? "opacity-60 pointer-events-none" : ""}`}
                role="radiogroup"
                aria-label="Select visa type"
              >
                {(["Employment", "Family"] as const).map((group) => {
                  const isActive = group === activeGroup;
                  return (
                    <button
                      key={group}
                      role="radio"
                      aria-checked={isActive}
                      aria-disabled={!!result}
                      onClick={() => {
                        if (result) return;
                        handleGroupChange(group);
                      }}
                      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#2F6BFF] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {group}-Based
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <fieldset>
              <legend className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Visa Category
              </legend>
              <div
                className={`inline-flex rounded-xl bg-muted p-1 shadow-inner ${result ? "opacity-60 pointer-events-none" : ""}`}
                role="radiogroup"
                aria-label={`Select ${activeGroup.toLowerCase()} visa category`}
              >
                {visibleCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      if (result) return;
                      setCategory(c);
                      resetResult();
                    }}
                    role="radio"
                    aria-checked={category === c}
                    aria-disabled={!!result}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                      category === c
                        ? "bg-[#2F6BFF] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } ${result && category === c ? "opacity-100" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Country */}
            <div>
              <CountryFlagSelector
                value={country}
                onChange={(c) => {
                  setCountry(c);
                  resetResult();
                }}
                label="Country"
                disabled={!!result}
                ariaLabel="Country"
              />
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
                disabled={!!result}
                onChange={(e) => {
                  setPriorityDate(e.target.value);
                  resetResult();
                }}
                aria-describedby="priority-date-hint"
                className={`riso-input-ruled w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20 focus-visible:ring-2 focus-visible:ring-[#2F6BFF] ${result ? "opacity-60" : ""}`}
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
              <div
                className={`inline-flex rounded-xl bg-muted p-1 shadow-inner ${result ? "opacity-60 pointer-events-none" : ""}`}
                role="radiogroup"
                aria-label="Processing Path"
              >
                {paths.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      if (result) return;
                      setPath(p);
                      resetResult();
                    }}
                    role="radio"
                    aria-checked={path === p}
                    aria-disabled={!!result}
                    className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                      path === p
                        ? "bg-[#2F6BFF] text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } ${result && path === p ? "opacity-100" : ""}`}
                  >
                    {p === "AOS" ? "Adjustment of Status" : "Consular Processing"}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Check / Reset Button */}
            {result ? (
              <Button
                onClick={resetResult}
                variant="outline"
                className="mt-1 w-full rounded-xl py-5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Change Selections
              </Button>
            ) : (
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
            )}
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
                <Card className="riso-doc-coral rounded-[18px] border border-rose-200 bg-rose-50/50 shadow-sm dark:border-rose-800 dark:bg-rose-950/20">
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

                {faCutoffDate && (
                  <div className="mt-3">
                    <JourneyProgress
                      priorityDate={priorityDate}
                      currentFinalAction={faCutoffDate}
                      currentFiling={filingCutoffDate ?? undefined}
                      category={category}
                      country={country}
                    />
                  </div>
                )}

                {/* Convergence Timeline - dual-line countdown visualization */}
                {priorityDate &&
                  !convergence.isLoading &&
                  convergence.finalActionHistory.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: 0.15 }}
                      className="mt-3"
                    >
                      <Card className="riso-doc-neutral rounded-[18px] border border-border/50 shadow-sm">
                        <CardContent className="p-5">
                          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
                            Convergence Timeline
                          </h3>
                          <ConvergenceTimeline
                            priorityDate={priorityDate}
                            finalActionHistory={convergence.finalActionHistory}
                            filingHistory={convergence.filingHistory}
                            category={category}
                            country={country}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

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

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Share Your Status
              </h3>
              <JourneySnapshot
                category={category}
                country={country}
                priorityDate={new Date(priorityDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                currentFinalAction={faCutoffDate ? new Date(faCutoffDate + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
                movement={result.eligibility.finalAction.state === "current" ? "Current" : "Not current"}
                direction={result.eligibility.finalAction.state === "current" ? "forward" : "none"}
                bulletinMonth={bulletinMonth ? new Date(bulletinMonth + "-01T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long" }) : ""}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved Trackers ── */}
        {savedTrackers.length > 0 && (
          <div>
            <h3 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Trackers
            </h3>
            <div className="flex flex-col gap-2">
              {savedTrackers.map((tracker) => {
                const isLoaded = activeTrackerId === tracker.id;
                return (
                  <motion.div
                    key={tracker.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Card
                      role="button"
                      tabIndex={0}
                      aria-label={`Load ${tracker.category} ${tracker.country} tracker`}
                      aria-pressed={isLoaded}
                      onClick={() => loadTracker(tracker)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          loadTracker(tracker);
                        }
                      }}
                      className={`cursor-pointer rounded-[18px] border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2 ${
                        isLoaded
                          ? "border-[#2F6BFF] bg-[#2F6BFF]/5 shadow-[0_0_0_1px_#2F6BFF,0_4px_12px_rgba(47,107,255,0.12)] dark:bg-[#2F6BFF]/10"
                          : "riso-doc-neutral border-border/50 hover:border-border"
                      }`}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={isLoaded ? "default" : "secondary"} className="text-[10px] font-semibold">
                              {tracker.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {tracker.country}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {tracker.path}
                            </Badge>
                            {isLoaded && (
                              <span className="text-[10px] font-medium text-[#2F6BFF]">
                                Active
                              </span>
                            )}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTracker(tracker.id);
                            if (isLoaded) setActiveTrackerId(null);
                          }}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2"
                          aria-label={`Remove ${tracker.category} ${tracker.country} tracker`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
        {savedTrackers.length === 0 && (
          <EmptyState
            title="No saved trackers yet"
            description="Check your priority date above, then save it to track your journey over time."
            action={{ label: "Add your first tracker", onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }) }}
          />
        )}
      </div>

      <SignInDialog open={showSignIn} onOpenChange={setShowSignIn} />
    </div>
  );
}
