"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, TrendingUp, Route, Palette, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  usePreferencesStore,
  COUNTRIES_BY_QUEUE,
  CATEGORIES,
  PATHS,
  type PreferredCountry,
  type PreferredCategory,
  type PreferredPath,
} from "@/stores/preferences-store";
import { useTheme, type Theme } from "@/components/theme-provider";

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

// ---------------------------------------------------------------------------
// Reusable SettingRow
// ---------------------------------------------------------------------------

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        <span className="mt-0.5 text-calm-blue sm:mt-0" aria-hidden="true">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip selector (pill-style segmented control)
// ---------------------------------------------------------------------------

function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  renderLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  renderLabel?: (v: T) => string;
}) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isActive = opt === value;
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2 ${
              isActive
                ? "bg-calm-blue text-white shadow-md"
                : "border border-border bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {renderLabel ? renderLabel(opt) : opt}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const {
    defaultCountry,
    defaultCategory,
    defaultPath,
    setDefaultCountry,
    setDefaultCategory,
    setDefaultPath,
    resetPreferences,
    completeOnboarding,
  } = usePreferencesStore();

  const { theme, setTheme } = useTheme();

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mark onboarded when user visits settings
  useEffect(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleReset = () => {
    resetPreferences();
    setTheme("system");
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6">
        <Link
          href="/"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">
            Personalize your tracking experience
          </p>
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5 px-4 pb-8 pt-4"
      >
        {/* ── Priority Configuration ── */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Globe className="h-4 w-4 text-calm-blue" aria-hidden="true" />
                Priority Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Set your defaults so the dashboard shows your data first.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <SettingRow
                icon={<Globe className="h-4 w-4" />}
                label="Default Country"
                description="Your country of chargeability. India and China have the longest queues."
              >
                <ChipSelector
                  options={COUNTRIES_BY_QUEUE}
                  value={defaultCountry}
                  onChange={setDefaultCountry}
                  ariaLabel="Default country"
                />
              </SettingRow>

              <Separator />

              <SettingRow
                icon={<TrendingUp className="h-4 w-4" />}
                label="Default Category"
                description="Your employment-based visa preference category."
              >
                <ChipSelector
                  options={CATEGORIES}
                  value={defaultCategory}
                  onChange={setDefaultCategory}
                  ariaLabel="Default visa category"
                />
              </SettingRow>

              <Separator />

              <SettingRow
                icon={<Route className="h-4 w-4" />}
                label="Processing Path"
                description="Adjustment of Status (US-based) or Consular Processing."
              >
                <ChipSelector
                  options={PATHS}
                  value={defaultPath}
                  onChange={setDefaultPath}
                  ariaLabel="Processing path"
                  renderLabel={(v) =>
                    v === "AOS" ? "Adjustment of Status" : "Consular Processing"
                  }
                />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Appearance ── */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[18px] border border-border/50 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Palette className="h-4 w-4 text-calm-blue" aria-hidden="true" />
                Appearance
              </CardTitle>
              <CardDescription className="text-xs">
                Choose how VisaDateTracker looks.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <SettingRow
                icon={<Palette className="h-4 w-4" />}
                label="Theme"
                description="Light, dark, or match your system preference."
              >
                <ChipSelector
                  options={["light", "dark", "system"] as const}
                  value={theme}
                  onChange={(v) => setTheme(v as Theme)}
                  ariaLabel="Theme preference"
                  renderLabel={(v) =>
                    v === "light" ? "Light" : v === "dark" ? "Dark" : "System"
                  }
                />
              </SettingRow>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Reset ── */}
        <motion.div variants={cardVariants}>
          <Card className="rounded-[18px] border border-destructive/20 bg-destructive/5 shadow-sm dark:bg-destructive/5">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:items-center">
                <RotateCcw
                  className="mt-0.5 h-4 w-4 text-destructive sm:mt-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Reset All Settings
                  </p>
                  <p className="mt-0.5 text-xs text-destructive/70">
                    Reverts country, category, path, and theme to defaults.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                className="w-full rounded-xl sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={cardVariants}>
          <p className="rounded-xl bg-muted/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            All preferences are stored locally on your device. No account is
            required and no data is sent to any server.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
