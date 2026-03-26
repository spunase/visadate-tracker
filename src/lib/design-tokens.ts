/**
 * Quiet Clarity Design System - Programmatic Tokens
 *
 * Use these constants when you need color/spacing values in JS/TS
 * (e.g. Recharts fills, inline styles, or dynamic theming).
 * For normal markup prefer the Tailwind utility classes defined in globals.css.
 */

// ─── Colors ──────────────────────────────────────────────────────

export const colors = {
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    primaryInk: "#111827",
    secondaryInk: "#4B5563",
    mutedBorder: "#E5E7EB",
    calmBlue: "#2F6BFF",
    insightTeal: "#0EA5A4",
    cautionAmber: "#D97706",
    alertRose: "#E11D48",
    successEmerald: "#059669",
  },
  dark: {
    background: "#0B1020",
    surface: "#121A2B",
    primaryInk: "#F3F4F6",
    secondaryInk: "#9CA3AF",
    mutedBorder: "#23304A",
    calmBlue: "#5B8CFF",
    insightTeal: "#2DD4BF",
    cautionAmber: "#FBBF24",
    alertRose: "#FB7185",
    successEmerald: "#34D399",
  },
} as const;

// ─── Status semantic colors ──────────────────────────────────────

export type VisaStatus =
  | "current"
  | "filing_current"
  | "not_current"
  | "retrogressed"
  | "unavailable";

export type MovementDirection = "advanced" | "retrogressed" | "flat";

export interface StatusStyle {
  /** Muted background tint */
  bg: string;
  /** Foreground / text / icon color */
  fg: string;
  /** Human-readable label */
  label: string;
}

export const statusColors: Record<VisaStatus, { light: StatusStyle; dark: StatusStyle }> = {
  current: {
    light: { bg: "#ECFDF5", fg: "#059669", label: "Current" },
    dark: { bg: "rgba(5,150,105,0.12)", fg: "#34D399", label: "Current" },
  },
  filing_current: {
    light: { bg: "#EFF6FF", fg: "#2F6BFF", label: "Filing Current" },
    dark: { bg: "rgba(47,107,255,0.12)", fg: "#5B8CFF", label: "Filing Current" },
  },
  not_current: {
    light: { bg: "#FFFBEB", fg: "#D97706", label: "Not Current" },
    dark: { bg: "rgba(217,119,6,0.12)", fg: "#FBBF24", label: "Not Current" },
  },
  retrogressed: {
    light: { bg: "#FFF1F2", fg: "#E11D48", label: "Retrogressed" },
    dark: { bg: "rgba(225,29,72,0.12)", fg: "#FB7185", label: "Retrogressed" },
  },
  unavailable: {
    light: { bg: "#F3F4F6", fg: "#6B7280", label: "Unavailable" },
    dark: { bg: "rgba(107,114,128,0.12)", fg: "#9CA3AF", label: "Unavailable" },
  },
} as const;

export const movementColors: Record<MovementDirection, { light: string; dark: string }> = {
  advanced: { light: "#059669", dark: "#34D399" },
  retrogressed: { light: "#E11D48", dark: "#FB7185" },
  flat: { light: "#6B7280", dark: "#9CA3AF" },
} as const;

// ─── Chart palette ───────────────────────────────────────────────

export const chartColors = {
  light: ["#2F6BFF", "#0EA5A4", "#059669", "#D97706", "#E11D48"],
  dark: ["#5B8CFF", "#2DD4BF", "#34D399", "#FBBF24", "#FB7185"],
} as const;

// ─── Spacing ─────────────────────────────────────────────────────

export const spacing = {
  /** 16px -padding inside cards */
  cardPadding: 16,
  /** 12px -gap between elements inside a card */
  intraCard: 12,
  /** 16px -left/right page margins */
  side: 16,
  /** 20px -vertical gap between sections */
  section: 20,
  /** 24px -top of page */
  pageTop: 24,
} as const;

// ─── Radii ───────────────────────────────────────────────────────

export const radii = {
  card: 18,
  pill: 999,
  modal: 24,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────

export const shadows = {
  card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)",
  cardHover: "0 4px 12px 0 rgb(0 0 0 / 0.06), 0 1px 3px -1px rgb(0 0 0 / 0.04)",
  modal: "0 8px 30px 0 rgb(0 0 0 / 0.08), 0 2px 8px -2px rgb(0 0 0 / 0.04)",
} as const;

// ─── Motion ──────────────────────────────────────────────────────

export const motion = {
  /** 180ms -snappy micro-interactions */
  fast: 180,
  /** 220ms -standard transitions */
  normal: 220,
} as const;

// ─── Typography ──────────────────────────────────────────────────

export const fontFamily =
  '"SF Pro", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif';

export const typeScale = {
  display: { size: 32, lineHeight: 38, weight: 600 },
  h1: { size: 24, lineHeight: 30, weight: 600 },
  h2: { size: 20, lineHeight: 26, weight: 600 },
  h3: { size: 18, lineHeight: 24, weight: 600 },
  bodyLg: { size: 16, lineHeight: 24, weight: 400 },
  body: { size: 15, lineHeight: 22, weight: 400 },
  caption: { size: 13, lineHeight: 18, weight: 500 },
  tiny: { size: 11, lineHeight: 16, weight: 500 },
} as const;
