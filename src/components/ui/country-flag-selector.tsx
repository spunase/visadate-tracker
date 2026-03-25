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
// Inline SVG flags — lightweight, resolution-independent, cross-platform
// Each renders a recognizable flag at any size via viewBox scaling
// ---------------------------------------------------------------------------

function IndiaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="900" height="200" fill="#FF9933" />
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      <rect y="400" width="900" height="200" fill="#138808" />
      <circle cx="450" cy="300" r="60" fill="#000080" fillOpacity="0" stroke="#000080" strokeWidth="6" />
      {/* Ashoka Chakra — simplified 24-spoke wheel */}
      <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="4" />
      <circle cx="450" cy="300" r="10" fill="#000080" />
      {[...Array(24)].map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x2 = 450 + 55 * Math.cos(angle);
        const y2 = 300 + 55 * Math.sin(angle);
        return <line key={i} x1="450" y1="300" x2={x2} y2={y2} stroke="#000080" strokeWidth="2" />;
      })}
    </svg>
  );
}

function ChinaFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="900" height="600" fill="#DE2910" />
      {/* Large star */}
      <polygon points="150,75 172,137 240,137 184,175 202,240 150,200 98,240 116,175 60,137 128,137" fill="#FFDE00" />
      {/* Small stars */}
      <polygon points="270,60 278,84 303,84 283,97 290,120 270,108 250,120 257,97 237,84 262,84" fill="#FFDE00" />
      <polygon points="312,120 320,144 345,144 325,157 332,180 312,168 292,180 299,157 279,144 304,144" fill="#FFDE00" />
      <polygon points="312,195 320,219 345,219 325,232 332,255 312,243 292,255 299,232 279,219 304,219" fill="#FFDE00" />
      <polygon points="270,240 278,264 303,264 283,277 290,300 270,288 250,300 257,277 237,264 262,264" fill="#FFDE00" />
    </svg>
  );
}

function PhilippinesFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="900" height="300" fill="#0038A8" />
      <rect y="300" width="900" height="300" fill="#CE1126" />
      {/* White triangle */}
      <polygon points="0,0 450,300 0,600" fill="#FFFFFF" />
      {/* Sun */}
      <circle cx="165" cy="300" r="42" fill="#FCD116" />
      {/* Sun rays — 8 major rays */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const x1 = 165 + 50 * Math.cos(angle);
        const y1 = 300 + 50 * Math.sin(angle);
        const x2 = 165 + 80 * Math.cos(angle);
        const y2 = 300 + 80 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FCD116" strokeWidth="8" />;
      })}
      {/* Three stars */}
      <polygon points="80,95 87,115 108,115 91,127 97,147 80,136 63,147 69,127 52,115 73,115" fill="#FCD116" />
      <polygon points="80,505 87,485 108,485 91,473 97,453 80,464 63,453 69,473 52,485 73,485" fill="#FCD116" />
      <polygon points="340,300 333,280 312,280 329,268 323,248 340,259 357,248 351,268 368,280 347,280" fill="#FCD116" />
    </svg>
  );
}

function MexicoFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="300" height="600" fill="#006847" />
      <rect x="300" width="300" height="600" fill="#FFFFFF" />
      <rect x="600" width="300" height="600" fill="#CE1126" />
      {/* Simplified coat of arms — eagle silhouette */}
      <circle cx="450" cy="300" r="55" fill="#006847" fillOpacity="0.15" />
      <ellipse cx="450" cy="290" rx="30" ry="22" fill="#6B3A2A" />
      {/* Wings */}
      <path d="M420,290 Q405,260 390,275 Q400,280 420,290Z" fill="#6B3A2A" />
      <path d="M480,290 Q495,260 510,275 Q500,280 480,290Z" fill="#6B3A2A" />
      {/* Snake */}
      <path d="M440,280 Q450,270 460,280" fill="none" stroke="#006847" strokeWidth="3" />
    </svg>
  );
}

/** Renders the correct SVG flag for a country, or Globe for "All Other" */
function CountryFlagImage({
  country,
  size,
  shape,
  isActive,
  accentColor,
}: {
  country: PreferredCountry;
  size: "sm" | "lg";
  shape: "circle" | "rounded";
  isActive: boolean;
  accentColor: string;
}) {
  const sizeClass = size === "sm" ? "h-5 w-5" : "h-10 w-10";
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg";

  if (country === "All Other") {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClass} ${shapeClass} bg-muted/80 transition-all duration-200`}
      >
        <Globe
          className={`${size === "sm" ? "h-3 w-3" : "h-5 w-5"} transition-colors duration-200 ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}
          strokeWidth={1.6}
        />
      </span>
    );
  }

  const FlagComponent = {
    India: IndiaFlag,
    China: ChinaFlag,
    Philippines: PhilippinesFlag,
    Mexico: MexicoFlag,
  }[country];

  return (
    <span
      className={`inline-block overflow-hidden ${sizeClass} ${shapeClass} transition-all duration-200`}
    >
      <FlagComponent className="h-full w-full" />
    </span>
  );
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
      {/* Flag in circular container */}
      <CountryFlagImage
        country={country}
        size="sm"
        shape="circle"
        isActive={isActive}
        accentColor={accent(meta, dark)}
      />

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

      {/* Flag in rounded container */}
      <span className="relative z-10">
        <CountryFlagImage
          country={country}
          size="lg"
          shape="rounded"
          isActive={isActive}
          accentColor={accentColor}
        />
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

