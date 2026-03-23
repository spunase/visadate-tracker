"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackerStore, type SavedTracker } from "@/stores/tracker-store";

const categories = ["EB1", "EB2", "EB3"] as const;
const countries = ["India", "China", "Mexico", "Philippines", "All Other"] as const;
const paths = ["AOS", "CP"] as const;

export default function TrackPage() {
  const [category, setCategory] = useState<SavedTracker["category"]>("EB2");
  const [country, setCountry] = useState<SavedTracker["country"]>("India");
  const [priorityDate, setPriorityDate] = useState("");
  const [path, setPath] = useState<SavedTracker["path"]>("AOS");
  const [checked, setChecked] = useState(false);

  const { savedTrackers, addTracker, removeTracker } = useTrackerStore();

  const handleCheck = () => {
    if (!priorityDate) return;
    setChecked(true);
  };

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
        {/* Input Form */}
        <Card className="rounded-[18px] border border-border/50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <div className="flex gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setChecked(false); }}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 ${
                      category === c
                        ? "bg-[#2F6BFF] text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Country of Chargeability
              </label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value as SavedTracker["country"]); setChecked(false); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20"
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority Date
              </label>
              <input
                type="date"
                value={priorityDate}
                onChange={(e) => { setPriorityDate(e.target.value); setChecked(false); }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-[#2F6BFF] focus:ring-2 focus:ring-[#2F6BFF]/20"
              />
            </div>

            {/* Path */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Processing Path
              </label>
              <div className="flex gap-2">
                {paths.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPath(p); setChecked(false); }}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200 ${
                      path === p
                        ? "bg-[#2F6BFF] text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {p === "AOS" ? "Adjustment of Status" : "Consular Processing"}
                  </button>
                ))}
              </div>
            </div>

            {/* Check Button */}
            <Button
              onClick={handleCheck}
              disabled={!priorityDate}
              className="mt-1 w-full rounded-xl bg-[#2F6BFF] py-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#254FCC] disabled:opacity-50"
            >
              Check Status
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <Card className="rounded-[18px] border border-emerald-200 bg-emerald-50/50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {category} {country} &mdash; {path}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Priority Date: {new Date(priorityDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <div className="mt-3 rounded-lg bg-white/60 p-3 dark:bg-white/5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-1/2" />
                        <p className="mt-3 text-[11px] text-muted-foreground">
                          Detailed status will be available once bulletin data is connected.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        className="mt-3 gap-1.5 rounded-lg text-xs"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Tracker
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Trackers */}
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
                          PD: {new Date(tracker.priorityDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTracker(tracker.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
