"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import {
  COUNTRIES_BY_QUEUE,
  COUNTRY_META,
  type PreferredCountry,
} from "@/stores/preferences-store";

/** Detect dark mode via the .dark class on <html> */
function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/** Get the accent color for a country, mode-aware */
function accent(meta: (typeof COUNTRY_META)[PreferredCountry], dark: boolean) {
  return dark ? meta.accentDark : meta.accentLight;
}
function glow(meta: (typeof COUNTRY_META)[PreferredCountry], dark: boolean) {
  return dark ? meta.glowDark : meta.glowLight;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

type Variant = "chips" | "cards";

interface CountryFlagSelectorProps {
  value: PreferredCountry;
  onChange: (country: PreferredCountry) => void;
  /** "chips" = compact inline pills (default), "cards" = larger square cards */
  variant?: Variant;
  /** Override the label text (set to `null` to hide) */
  label?: string | null;
  /** Disable interaction (e.g. when results are locked) */
  disabled?: boolean;
  ariaLabel?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CountryFlagSelector({
  value,
  onChange,
  variant = "chips",
  label = "Country of Charge",
  disabled = false,
  ariaLabel = "Select country",
}: CountryFlagSelectorProps) {
  const isCards = variant === "cards";
  const dark = useIsDark();

  return (
    <div className={isCards ? "space-y-3" : ""}>
      {label !== null && (
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}

      <motion.div
        className={
          isCards
            ? "grid grid-cols-3 gap-2.5 sm:grid-cols-5"
            : "flex flex-wrap gap-1.5"
        }
        role="radiogroup"
        aria-label={ariaLabel}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {COUNTRIES_BY_QUEUE.map((country) => {
          const isActive = country === value;
          const meta = COUNTRY_META[country];

          if (isCards) {
            return (
              <CardOption
                key={country}
                country={country}
                meta={meta}
                isActive={isActive}
                disabled={disabled}
                dark={dark}
                onChange={onChange}
              />
            );
          }

          return (
            <ChipOption
              key={country}
              country={country}
              meta={meta}
              isActive={isActive}
              disabled={disabled}
              dark={dark}
              onChange={onChange}
            />
          );
        })}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chip variant (compact inline pills with flag)
// ---------------------------------------------------------------------------

function ChipOption({
  country,
  meta,
  isActive,
  disabled,
  dark,
  onChange,
}: {
  country: PreferredCountry;
  meta: (typeof COUNTRY_META)[PreferredCountry];
  isActive: boolean;
  disabled: boolean;
  dark: boolean;
  onChange: (c: PreferredCountry) => void;
}) {
  return (
    <motion.button
      variants={chipVariants}
      role="radio"
      aria-checked={isActive}
      aria-disabled={disabled}
      onClick={() => !disabled && onChange(country)}
      whileHover={disabled ? undefined : { scale: 1.05, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2
        ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}
        ${
          isActive
            ? "text-white shadow-md"
            : "border border-border bg-card text-muted-foreground hover:bg-accent"
        }`}
      style={
        isActive
          ? {
              background: accent(meta, dark),
              boxShadow: `0 4px 14px ${glow(meta, dark)}, 0 1px 3px rgba(0,0,0,0.08)`,
            }
          : undefined
      }
    >
      {/* Flag or Globe */}
      <span className="text-sm leading-none select-none" aria-hidden="true">
        {country === "All Other" ? (
          <Globe className="h-3.5 w-3.5" />
        ) : (
          meta.flag
        )}
      </span>

      {/* Country name */}
      <span>{country}</span>

      {/* Active indicator dot */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white shadow-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Card variant (larger square cards with prominent flag)
// ---------------------------------------------------------------------------

function CardOption({
  country,
  meta,
  isActive,
  disabled,
  dark,
  onChange,
}: {
  country: PreferredCountry;
  meta: (typeof COUNTRY_META)[PreferredCountry];
  isActive: boolean;
  disabled: boolean;
  dark: boolean;
  onChange: (c: PreferredCountry) => void;
}) {
  const accentColor = accent(meta, dark);
  const glowColor = glow(meta, dark);

  return (
    <motion.button
      variants={chipVariants}
      role="radio"
      aria-checked={isActive}
      aria-disabled={disabled}
      aria-label={`Select ${country}`}
      onClick={() => !disabled && onChange(country)}
      whileHover={disabled ? undefined : { scale: 1.04, y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-[18px] p-3 transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2
        ${disabled ? "pointer-events-none opacity-60" : "cursor-pointer"}
        ${
          isActive
            ? "border-2 bg-card shadow-lg"
            : "border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent/50"
        }`}
      style={
        isActive
          ? {
              borderColor: accentColor,
              boxShadow: `0 0 0 1px ${accentColor}, 0 8px 24px ${glowColor}, 0 2px 6px rgba(0,0,0,0.06)`,
            }
          : undefined
      }
    >
      {/* Active glow backdrop */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-none absolute inset-0 rounded-[17px]"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${glowColor} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Flag / Globe icon */}
      <span className="relative z-10 select-none" aria-hidden="true">
        {country === "All Other" ? (
          <Globe
            className={`h-8 w-8 transition-colors duration-200 ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
            strokeWidth={1.4}
          />
        ) : (
          <span className="text-3xl leading-none drop-shadow-sm">
            {meta.flag}
          </span>
        )}
      </span>

      {/* Country name */}
      <span
        className={`relative z-10 text-[11px] font-semibold leading-tight text-center transition-colors duration-200 ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {country === "All Other" ? "Other" : country}
      </span>

      {/* Active check dot */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute -right-1 -top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full shadow-sm"
            style={{ background: accentColor }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 6.5L5 9L9.5 3.5" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

