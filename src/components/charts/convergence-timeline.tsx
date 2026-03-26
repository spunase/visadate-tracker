"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { useThemeStore } from "@/stores/theme-store";
import type { HistoryEntry } from "@/lib/hooks/use-history";

// ─── Types ─────────────────────────────────────────────────────

export interface ConvergenceTimelineProps {
  /** User's priority date as ISO string (YYYY-MM-DD) */
  priorityDate: string;
  /** Historical Final Action cutoff movements */
  finalActionHistory: HistoryEntry[];
  /** Historical Filing Date cutoff movements */
  filingHistory: HistoryEntry[];
  category: string;
  country: string;
}

type FocusedLine = "fa" | "filing";

// ─── Theme palettes ────────────────────────────────────────────

const palettes = {
  risograph: {
    faLine: "#6CC5BB",
    filingLine: "#DEAD45",
    pdLine: "#C43C3C",
    pdFill: "#C43C3C",
    forward: "#4AADA3",
    backward: "#CF7B73",
    unchanged: "#D1CABD",
    grid: "#D1CABD",
    axisText: "#8A847E",
    tooltipBg: "#FAF5ED",
    tooltipBorder: "#D1CABD",
    tooltipText: "#2D2B2A",
    tooltipMuted: "#6B6560",
    glowFrom: "hsl(170 45% 48%)",
    glowTo: "hsl(40 70% 55%)",
    meterTrack: "#E8E0D4",
    meterFill: "#4AADA3",
    meterHot: "#C43C3C",
    cardBg: "var(--color-card)",
    cardBorder: "var(--color-border)",
    stageFar: "#8A847E",
    stageApproaching: "#6CC5BB",
    stageClose: "#DEAD45",
    stageAlmost: "#CF7B73",
    stageCurrent: "#4AADA3",
    // Segmented control
    segmentBg: "rgba(209,202,189,0.35)",
    segmentIndicator: "rgba(250,245,237,0.92)",
    segmentTextActive: "#2D2B2A",
    segmentTextInactive: "#8A847E",
    segmentBorder: "rgba(209,202,189,0.5)",
    // Focus line gradients
    faGlowFrom: "#6CC5BB",
    faGlowTo: "#4AADA3",
    filingGlowFrom: "#DEAD45",
    filingGlowTo: "#D4A843",
    faAreaFill: "rgba(108,197,187,0.12)",
    filingAreaFill: "rgba(222,173,69,0.12)",
  },
  "quiet-clarity": {
    faLine: "#2F6BFF",
    filingLine: "#0EA5A4",
    pdLine: "#D97706",
    pdFill: "#D97706",
    forward: "#059669",
    backward: "#E11D48",
    unchanged: "#6B7280",
    grid: "#E5E7EB",
    axisText: "#6B7280",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E7EB",
    tooltipText: "#111827",
    tooltipMuted: "#6B7280",
    glowFrom: "hsl(215 80% 55%)",
    glowTo: "hsl(35 90% 55%)",
    meterTrack: "#E5E7EB",
    meterFill: "#2F6BFF",
    meterHot: "#D97706",
    cardBg: "var(--color-card)",
    cardBorder: "var(--color-border)",
    stageFar: "#6B7280",
    stageApproaching: "#2F6BFF",
    stageClose: "#0EA5A4",
    stageAlmost: "#D97706",
    stageCurrent: "#059669",
    // Segmented control
    segmentBg: "rgba(229,231,235,0.5)",
    segmentIndicator: "rgba(255,255,255,0.95)",
    segmentTextActive: "#111827",
    segmentTextInactive: "#6B7280",
    segmentBorder: "rgba(229,231,235,0.7)",
    // Focus line gradients
    faGlowFrom: "#2F6BFF",
    faGlowTo: "#5B8CFF",
    filingGlowFrom: "#0EA5A4",
    filingGlowTo: "#14B8A6",
    faAreaFill: "rgba(47,107,255,0.10)",
    filingAreaFill: "rgba(14,165,164,0.10)",
  },
} as const;

// ─── Stage logic ───────────────────────────────────────────────

interface Stage {
  key: string;
  label: string;
  colorKey: keyof (typeof palettes)["quiet-clarity"];
}

function getStage(gapDays: number): Stage {
  if (gapDays <= 0)
    return { key: "current", label: "Current!", colorKey: "stageCurrent" };
  if (gapDays <= 30)
    return { key: "almost", label: "Almost There", colorKey: "stageAlmost" };
  if (gapDays <= 180)
    return { key: "close", label: "Getting Close", colorKey: "stageClose" };
  if (gapDays <= 365)
    return {
      key: "approaching",
      label: "Approaching",
      colorKey: "stageApproaching",
    };
  return { key: "far", label: "Far Out", colorKey: "stageFar" };
}

// ─── Helpers ───────────────────────────────────────────────────

function toTs(iso: string): number {
  return new Date(iso).getTime();
}

function formatMonthAbbr(iso: string): string {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatMonthFull(iso: string): string {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAxisDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

// ─── Focused-line pulsing dot ──────────────────────────────────

interface FocusDotProps {
  cx?: number;
  cy?: number;
  payload?: { isLast?: boolean };
  color: string;
  isFocused: boolean;
}

function FocusDot({ cx, cy, payload, color, isFocused }: FocusDotProps) {
  if (cx == null || cy == null) return null;

  // Non-focused line: small static dot
  if (!isFocused) {
    return <circle cx={cx} cy={cy} r={2} fill={color} opacity={0.4} />;
  }

  // Focused line: latest point gets pulsing ring
  if (payload?.isLast) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.3}
        >
          <animate
            attributeName="r"
            values="8;13;8"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.15;0.45;0.15"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.15} />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill={color}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
        />
      </g>
    );
  }

  // Focused line: regular points - small solid dot
  return <circle cx={cx} cy={cy} r={2.5} fill={color} strokeWidth={0} />;
}

// ─── Split-Flap Digit Display ──────────────────────────────────

/**
 * Single flap card with spin-up intro: cycles 0 -> 1 -> ... -> target digit
 * ascending, then settles. On subsequent changes, does a single flip.
 */
const FLIP_DURATION = 100; // ms per flip step during spin-up

function SplitFlapDigit({
  digit,
  staggerMs = 0,
  reduceMotion = false,
}: {
  digit: string;
  /** Extra delay before this position starts spinning (ms) */
  staggerMs?: number;
  reduceMotion?: boolean;
}) {
  const isNumeric = /^\d$/.test(digit);
  // displayDigit is what's currently shown (animates through values)
  const [displayDigit, setDisplayDigit] = useState(isNumeric && !reduceMotion ? "0" : digit);
  const [flipFrom, setFlipFrom] = useState<string | null>(null);
  const targetRef = useRef(digit);
  const hasInitialized = useRef(false);
  const animFrameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Intro spin-up: cycle 0..target ascending
  useEffect(() => {
    if (reduceMotion || !isNumeric || hasInitialized.current) {
      hasInitialized.current = true;
      setDisplayDigit(digit);
      return;
    }
    hasInitialized.current = true;
    const target = parseInt(digit, 10);

    // Start after stagger delay
    const staggerTimer = setTimeout(() => {
      let current = 0;
      const step = () => {
        if (current < target) {
          const prev = String(current);
          current++;
          setFlipFrom(prev);
          setDisplayDigit(String(current));
          animFrameRef.current = setTimeout(step, FLIP_DURATION);
        } else {
          // Settle
          setTimeout(() => setFlipFrom(null), FLIP_DURATION + 50);
        }
      };
      // Show "0" briefly, then start flipping
      animFrameRef.current = setTimeout(step, FLIP_DURATION);
    }, staggerMs);

    return () => {
      clearTimeout(staggerTimer);
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subsequent value changes: single flip
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (digit !== targetRef.current) {
      const old = targetRef.current;
      targetRef.current = digit;
      if (reduceMotion) {
        setDisplayDigit(digit);
        return;
      }
      setFlipFrom(displayDigit);
      setDisplayDigit(digit);
      setTimeout(() => {
        setFlipFrom((prev) => (prev === old ? null : prev));
      }, 350);
    }
  }, [digit, reduceMotion, displayDigit]);

  const isComma = digit === ",";

  return (
    <span
      className="relative inline-flex flex-col overflow-hidden rounded-[5px]"
      style={{
        width: isComma ? 12 : 28,
        height: 42,
        background:
          "linear-gradient(180deg, #1a1a1a 0%, #1a1a1a 49.5%, #141414 50%, #111 100%)",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        perspective: 200,
      }}
    >
      {/* Center divider line */}
      <span
        className="pointer-events-none absolute inset-x-0 z-20"
        style={{ top: "50%", height: 1, background: "rgba(0,0,0,0.6)" }}
      />

      {/* Static current digit (back face) */}
      <span
        className="absolute inset-0 z-0 flex items-center justify-center font-mono text-[26px] font-extrabold leading-none tracking-tight text-white"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
      >
        {displayDigit}
      </span>

      {/* Flip animation overlay */}
      {flipFrom !== null && !reduceMotion && (
        <>
          {/* Top half flipping away - shows old digit */}
          <motion.span
            key={`top-${flipFrom}-${displayDigit}`}
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-center overflow-hidden rounded-t-[5px] font-mono text-[26px] font-extrabold leading-none tracking-tight text-white"
            style={{
              height: "50%",
              background: "linear-gradient(180deg, #1a1a1a 0%, #1a1a1a 100%)",
              transformOrigin: "bottom center",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: 0.08, ease: "easeIn" }}
          >
            <span className="translate-y-1/2">{flipFrom}</span>
          </motion.span>

          {/* Bottom half flipping in - shows new digit */}
          <motion.span
            key={`bot-${flipFrom}-${displayDigit}`}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center overflow-hidden rounded-b-[5px] font-mono text-[26px] font-extrabold leading-none tracking-tight text-white"
            style={{
              height: "50%",
              background: "linear-gradient(180deg, #141414 0%, #111 100%)",
              transformOrigin: "top center",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              backfaceVisibility: "hidden",
            }}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: 0.08, delay: 0.05, ease: "easeOut" }}
          >
            <span className="-translate-y-1/2">{displayDigit}</span>
          </motion.span>
        </>
      )}
    </span>
  );
}

/** Split-flap scoreboard display for a number with cascading spin-up. */
function SplitFlapDisplay({
  value,
  reduceMotion = false,
}: {
  value: number;
  reduceMotion?: boolean;
}) {
  const digits = value.toLocaleString().split("");

  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${value} days`}>
      {digits.map((d, i) => (
        <SplitFlapDigit
          key={`pos-${digits.length - i}`}
          digit={d}
          staggerMs={i * 120}
          reduceMotion={reduceMotion}
        />
      ))}
    </span>
  );
}

// ─── Custom tooltip ────────────────────────────────────────────

interface ConvergenceTooltipPayload {
  payload: {
    monthLabel: string;
    faLabel: string | null;
    filingLabel: string | null;
    faDirection?: string;
    filingDirection?: string;
    faMovement?: number;
    filingMovement?: number;
  };
}

interface ConvergenceTooltipProps {
  active?: boolean;
  payload?: ConvergenceTooltipPayload[];
  palette: (typeof palettes)[keyof typeof palettes];
  pdLabel: string;
  focusedLine: FocusedLine;
}

function ConvergenceTooltip({
  active,
  payload,
  palette,
  pdLabel,
  focusedLine,
}: ConvergenceTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const movLabel = (days: number | undefined, dir: string | undefined) => {
    if (!dir || dir === "unchanged") return "No change";
    const sign = dir === "forward" ? "+" : "-";
    const abs = Math.abs(days ?? 0);
    return `${sign}${abs}d`;
  };

  // Show the focused line first, with emphasis
  const lines = [
    {
      key: "fa" as const,
      label: "Final Action",
      date: d.faLabel,
      dir: d.faDirection,
      mov: d.faMovement,
      color: palette.faLine,
    },
    {
      key: "filing" as const,
      label: "Filing",
      date: d.filingLabel,
      dir: d.filingDirection,
      mov: d.filingMovement,
      color: palette.filingLine,
    },
  ].sort((a, b) =>
    a.key === focusedLine ? -1 : b.key === focusedLine ? 1 : 0,
  );

  return (
    <div
      className="max-w-[260px] rounded-xl border-2 px-4 py-3 shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: palette.tooltipBg,
        borderColor: palette.tooltipBorder,
      }}
    >
      <p
        className="font-heading text-sm font-semibold"
        style={{ color: palette.tooltipText }}
      >
        {d.monthLabel}
      </p>

      {lines.map(
        (line) =>
          line.date && (
            <p
              key={line.key}
              className="mt-1 text-xs"
              style={{
                color:
                  line.key === focusedLine
                    ? palette.tooltipText
                    : palette.tooltipMuted,
                fontWeight: line.key === focusedLine ? 600 : 400,
              }}
            >
              <span
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{
                  backgroundColor: line.color,
                  opacity: line.key === focusedLine ? 1 : 0.5,
                }}
              />
              {line.label}: {line.date}{" "}
              <span style={{ color: line.color, fontWeight: 600 }}>
                {movLabel(line.mov, line.dir)}
              </span>
            </p>
          ),
      )}

      <p
        className="mt-1.5 border-t pt-1.5 text-[10px]"
        style={{
          borderColor: palette.tooltipBorder,
          color: palette.tooltipMuted,
        }}
      >
        Your PD: {pdLabel}
      </p>
    </div>
  );
}

// ─── Proximity meter ───────────────────────────────────────────

function ProximityMeter({
  intensity,
  palette,
  prefersReduced,
}: {
  intensity: number;
  palette: (typeof palettes)[keyof typeof palettes];
  prefersReduced: boolean | null;
}) {
  const pct = Math.min(100, Math.max(0, intensity * 100));

  return (
    <div
      className="relative h-2 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: palette.meterTrack }}
    >
      <motion.div
        className="h-full origin-left rounded-full"
        style={{
          background: `linear-gradient(90deg, ${palette.meterFill}, ${palette.meterHot})`,
        }}
        initial={prefersReduced ? { scaleX: pct / 100 } : { scaleX: 0 }}
        animate={{ scaleX: pct / 100 }}
        transition={
          prefersReduced
            ? { duration: 0 }
            : { type: "spring", stiffness: 60, damping: 20, mass: 0.8 }
        }
      />
      {intensity > 0.6 && !prefersReduced && (
        <motion.div
          className="absolute top-0 h-full w-4 rounded-full"
          style={{
            left: `${pct - 2}%`,
            background: `radial-gradient(circle, ${palette.meterHot}80, transparent)`,
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

// ─── Segmented control ─────────────────────────────────────────

function SegmentedToggle({
  value,
  onChange,
  palette,
  prefersReduced,
}: {
  value: FocusedLine;
  onChange: (v: FocusedLine) => void;
  palette: (typeof palettes)[keyof typeof palettes];
  prefersReduced: boolean | null;
}) {
  const options: { key: FocusedLine; label: string }[] = [
    { key: "fa", label: "Final Action" },
    { key: "filing", label: "Filing Dates" },
  ];

  return (
    <div
      className="relative flex items-center rounded-[12px] p-[3px]"
      style={{
        backgroundColor: palette.segmentBg,
        border: `1px solid ${palette.segmentBorder}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="tablist"
      aria-label="Select date type to emphasize"
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute inset-y-[3px] rounded-[9px]"
        style={{
          backgroundColor: palette.segmentIndicator,
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          width: "calc(50% - 3px)",
        }}
        animate={{ x: value === "fa" ? 0 : "calc(100% + 3px)" }}
        transition={
          prefersReduced
            ? { duration: 0.1 }
            : { type: "spring", stiffness: 320, damping: 30 }
        }
        aria-hidden="true"
      />

      {options.map((opt) => {
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            role="tab"
            aria-selected={isActive}
            className="relative z-10 flex-1 rounded-[9px] px-3 py-1.5 text-[11px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-1"
            style={{
              color: isActive
                ? palette.segmentTextActive
                : palette.segmentTextInactive,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Animation variants ────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

// ─── Main component ────────────────────────────────────────────

export function ConvergenceTimeline({
  priorityDate,
  finalActionHistory,
  filingHistory,
  category,
  country,
}: ConvergenceTimelineProps) {
  const theme = useThemeStore((s) => s.theme);
  const palette = palettes[theme] ?? palettes["quiet-clarity"];
  const prefersReduced = useReducedMotion();

  const [focusedLine, setFocusedLine] = useState<FocusedLine>("fa");

  // ── Derived data ─────────────────────────────────────────────
  const {
    chartData,
    gapDays,
    effectiveLabel,
    effectiveType,
    intensity,
    stage,
    avgVelocity,
    estimatedMonths,
    yMin,
    yMax,
    pdTs,
  } = useMemo(() => {
    const latestFA =
      finalActionHistory.length > 0
        ? finalActionHistory[finalActionHistory.length - 1]
        : null;
    const latestFiling =
      filingHistory.length > 0
        ? filingHistory[filingHistory.length - 1]
        : null;

    const faTs = latestFA ? toTs(latestFA.cutoffDate) : 0;
    const filTs = latestFiling ? toTs(latestFiling.cutoffDate) : 0;
    const pdTimestamp = toTs(priorityDate);

    const effectiveTs = Math.max(faTs, filTs);
    const effType = faTs >= filTs ? "Final Action" : "Filing";
    const effLabel =
      effType === "Final Action" && latestFA
        ? formatDateShort(latestFA.cutoffDate)
        : latestFiling
          ? formatDateShort(latestFiling.cutoffDate)
          : "-";

    const gapMs = pdTimestamp - effectiveTs;
    const gapD = Math.max(0, Math.round(gapMs / 86_400_000));
    const maxRange = 365 * 2;
    const inten = Math.max(0, Math.min(1, 1 - gapD / maxRange));
    const stg = getStage(gapD);

    // Build unified chart data
    const monthMap = new Map<
      string,
      {
        fa?: { cutoff: number; label: string; dir: string; mov: number };
        filing?: { cutoff: number; label: string; dir: string; mov: number };
      }
    >();

    for (const entry of finalActionHistory) {
      if (entry.cutoffDate === "current") continue;
      const existing = monthMap.get(entry.bulletinMonth) ?? {};
      existing.fa = {
        cutoff: toTs(entry.cutoffDate),
        label: formatDateShort(entry.cutoffDate),
        dir: entry.movementDirection,
        mov: entry.movementDays,
      };
      monthMap.set(entry.bulletinMonth, existing);
    }

    for (const entry of filingHistory) {
      if (entry.cutoffDate === "current") continue;
      const existing = monthMap.get(entry.bulletinMonth) ?? {};
      existing.filing = {
        cutoff: toTs(entry.cutoffDate),
        label: formatDateShort(entry.cutoffDate),
        dir: entry.movementDirection,
        mov: entry.movementDays,
      };
      monthMap.set(entry.bulletinMonth, existing);
    }

    const sortedMonths = [...monthMap.keys()].sort();
    const cData = sortedMonths.map((month, i) => {
      const entry = monthMap.get(month)!;
      return {
        month: formatMonthAbbr(month),
        monthLabel: formatMonthFull(month),
        faCutoff: entry.fa?.cutoff ?? null,
        filingCutoff: entry.filing?.cutoff ?? null,
        faLabel: entry.fa?.label ?? null,
        filingLabel: entry.filing?.label ?? null,
        faDirection: entry.fa?.dir,
        filingDirection: entry.filing?.dir,
        faMovement: entry.fa?.mov,
        filingMovement: entry.filing?.mov,
        isLast: i === sortedMonths.length - 1,
      };
    });

    const allTs = cData.flatMap((d) =>
      [d.faCutoff, d.filingCutoff].filter((v): v is number => v != null),
    );
    allTs.push(pdTimestamp);
    const minT = Math.min(...allTs);
    const maxT = Math.max(...allTs);
    const pad = (maxT - minT) * 0.08 || 86_400_000 * 30;

    const effectiveHistory =
      effType === "Final Action" ? finalActionHistory : filingHistory;
    const forwardMonths = effectiveHistory.filter(
      (e) => e.movementDirection === "forward",
    );
    const avgVel =
      forwardMonths.length > 0
        ? Math.round(
            forwardMonths.reduce((s, e) => s + e.movementDays, 0) /
              forwardMonths.length,
          )
        : 0;

    const estMonths = avgVel > 0 ? Math.ceil(gapD / avgVel) : null;

    return {
      chartData: cData,
      gapDays: gapD,
      effectiveLabel: effLabel,
      effectiveType: effType,
      intensity: inten,
      stage: stg,
      avgVelocity: avgVel,
      estimatedMonths: estMonths,
      yMin: minT - pad,
      yMax: maxT + pad,
      pdTs: pdTimestamp,
    };
  }, [priorityDate, finalActionHistory, filingHistory]);

  // ── Guard: not enough data ───────────────────────────────────
  if (chartData.length < 2) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground">
        Need at least 2 months of data for the convergence timeline.
      </p>
    );
  }

  const isCurrent = gapDays <= 0;
  const stageColor = palette[stage.colorKey];

  // Determine line visual properties based on focus
  const faIsFocused = focusedLine === "fa";
  const filingIsFocused = focusedLine === "filing";

  // Unique gradient IDs
  const faGradId = `ct-fa-grad-${category}-${country}`.replace(/\s+/g, "-");
  const filingGradId = `ct-filing-grad-${category}-${country}`.replace(
    /\s+/g,
    "-",
  );
  const faAreaGradId = `ct-fa-area-${category}-${country}`.replace(
    /\s+/g,
    "-",
  );
  const filingAreaGradId = `ct-filing-area-${category}-${country}`.replace(
    /\s+/g,
    "-",
  );
  const glowFilterId = `ct-glow-${category}-${country}`.replace(/\s+/g, "-");

  // ── Accessibility ────────────────────────────────────────────
  const ariaLabel = `Convergence timeline for ${category} ${country}. ${
    isCurrent
      ? "Your priority date is current!"
      : `${gapDays} days until your priority date becomes current. Stage: ${stage.label}.`
  } Currently viewing ${focusedLine === "fa" ? "Final Action" : "Filing"} dates. Showing both Final Action and Filing cutoff date movements over ${chartData.length} months.`;

  return (
    <motion.div
      variants={prefersReduced ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      aria-label={ariaLabel}
      role="region"
    >
      {/* ── Header: Countdown + Segmented Toggle ─────────────── */}
      <motion.div
        variants={prefersReduced ? undefined : itemVariants}
        className="flex items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {isCurrent ? "Status" : "Days Until Current"}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            {isCurrent ? (
              <span
                className="text-3xl font-extrabold"
                style={{ color: stageColor }}
              >
                Current!
              </span>
            ) : (
              <>
                <SplitFlapDisplay
                  value={gapDays}
                  reduceMotion={!!prefersReduced}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  days
                </span>
              </>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            via {effectiveType} &middot; {effectiveLabel}
          </p>
        </div>

        {/* Stage badge */}
        <div className="flex flex-col items-end gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={stage.key}
              initial={prefersReduced ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={prefersReduced ? undefined : { scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: stageColor }}
              aria-live="polite"
            >
              {stage.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Proximity Meter ───────────────────────────────────── */}
      <motion.div variants={prefersReduced ? undefined : itemVariants}>
        <ProximityMeter
          intensity={intensity}
          palette={palette}
          prefersReduced={prefersReduced}
        />
      </motion.div>

      {/* ── Segmented Toggle (inside chart area) ──────────────── */}
      <motion.div
        variants={prefersReduced ? undefined : itemVariants}
        className="flex justify-center"
      >
        <SegmentedToggle
          value={focusedLine}
          onChange={setFocusedLine}
          palette={palette}
          prefersReduced={prefersReduced}
        />
      </motion.div>

      {/* ── Dual-line Chart with Focus Effect ─────────────────── */}
      <motion.div variants={prefersReduced ? undefined : itemVariants}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
          >
            <defs>
              {/* FA line gradient */}
              <linearGradient id={faGradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={palette.faGlowFrom} />
                <stop offset="100%" stopColor={palette.faGlowTo} />
              </linearGradient>

              {/* Filing line gradient */}
              <linearGradient id={filingGradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={palette.filingGlowFrom} />
                <stop offset="100%" stopColor={palette.filingGlowTo} />
              </linearGradient>

              {/* FA area gradient */}
              <linearGradient id={faAreaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={palette.faLine}
                  stopOpacity={0.14}
                />
                <stop
                  offset="100%"
                  stopColor={palette.faLine}
                  stopOpacity={0.01}
                />
              </linearGradient>

              {/* Filing area gradient */}
              <linearGradient
                id={filingAreaGradId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={palette.filingLine}
                  stopOpacity={0.14}
                />
                <stop
                  offset="100%"
                  stopColor={palette.filingLine}
                  stopOpacity={0.01}
                />
              </linearGradient>

              {/* Glow filter for focused line */}
              <filter
                id={glowFilterId}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="3"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* PD glow */}
              <linearGradient
                id="convergence-pd-glow"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={palette.pdLine}
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor={palette.pdLine}
                  stopOpacity={0.03}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={palette.grid}
              opacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: palette.axisText }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={formatAxisDate}
              tick={{ fontSize: 10, fill: palette.axisText }}
              axisLine={false}
              tickLine={false}
              width={52}
            />

            <Tooltip
              content={
                <ConvergenceTooltip
                  palette={palette}
                  pdLabel={formatDateShort(priorityDate)}
                  focusedLine={focusedLine}
                />
              }
              cursor={{ stroke: palette.grid, strokeDasharray: "3 3" }}
            />

            {/* Priority Date - golden reference line */}
            <ReferenceLine
              y={pdTs}
              stroke={palette.pdLine}
              strokeWidth={2}
              strokeDasharray="6 3"
              label={{
                value: `Your PD`,
                position: "right",
                fill: palette.pdLine,
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* ── Area fill for focused line (render first, behind lines) */}
            {/* key forces Recharts to fully re-mount when focus changes */}
            {faIsFocused && (
              <Area
                key="fa-area-focused"
                type="monotone"
                dataKey="faCutoff"
                fill={`url(#${faAreaGradId})`}
                stroke="none"
                animationDuration={800}
                animationEasing="ease-out"
                connectNulls
              />
            )}
            {filingIsFocused && (
              <Area
                key="filing-area-focused"
                type="monotone"
                dataKey="filingCutoff"
                fill={`url(#${filingAreaGradId})`}
                stroke="none"
                animationDuration={800}
                animationEasing="ease-out"
                connectNulls
              />
            )}

            {/* ── Unfocused line renders first (behind) ──────── */}
            {/* Filing line - key includes focus state to force re-render */}
            <Line
              key={`filing-${focusedLine}`}
              type="monotone"
              dataKey="filingCutoff"
              stroke={
                filingIsFocused
                  ? `url(#${filingGradId})`
                  : palette.filingLine
              }
              strokeWidth={filingIsFocused ? 3 : 1.5}
              strokeLinecap="round"
              strokeDasharray={filingIsFocused ? undefined : "4 3"}
              strokeOpacity={filingIsFocused ? 1 : 0.35}
              filter={filingIsFocused ? `url(#${glowFilterId})` : undefined}
              dot={(props: Record<string, unknown>) => (
                <FocusDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                  payload={props.payload as FocusDotProps["payload"]}
                  color={palette.filingLine}
                  isFocused={filingIsFocused}
                />
              )}
              activeDot={{
                r: filingIsFocused ? 5 : 3,
                fill: palette.filingLine,
                stroke: "white",
                strokeWidth: filingIsFocused ? 2 : 1,
              }}
              connectNulls
              animationDuration={1400}
              animationEasing="ease-out"
              name="Filing"
            />

            {/* Final Action line - key includes focus state to force re-render */}
            <Line
              key={`fa-${focusedLine}`}
              type="monotone"
              dataKey="faCutoff"
              stroke={
                faIsFocused ? `url(#${faGradId})` : palette.faLine
              }
              strokeWidth={faIsFocused ? 3 : 1.5}
              strokeLinecap="round"
              strokeDasharray={faIsFocused ? undefined : "4 3"}
              strokeOpacity={faIsFocused ? 1 : 0.35}
              filter={faIsFocused ? `url(#${glowFilterId})` : undefined}
              dot={(props: Record<string, unknown>) => (
                <FocusDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                  payload={props.payload as FocusDotProps["payload"]}
                  color={palette.faLine}
                  isFocused={faIsFocused}
                />
              )}
              activeDot={{
                r: faIsFocused ? 5 : 3,
                fill: palette.faLine,
                stroke: "white",
                strokeWidth: faIsFocused ? 2 : 1,
              }}
              connectNulls
              animationDuration={1400}
              animationEasing="ease-out"
              name="Final Action"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Screen reader data */}
        <p className="sr-only">
          {category} {country} convergence data:{" "}
          {chartData
            .map(
              (d) =>
                `${d.monthLabel}: FA ${d.faLabel ?? "N/A"}, Filing ${d.filingLabel ?? "N/A"}`,
            )
            .join(". ")}
          . Your priority date: {formatDateShort(priorityDate)}.
        </p>
      </motion.div>

      {/* ── Legend ─────────────────────────────────────────────── */}
      <motion.div
        variants={prefersReduced ? undefined : itemVariants}
        className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground"
      >
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-[3px] w-3 rounded-full"
            style={{
              backgroundColor: palette.faLine,
              opacity: faIsFocused ? 1 : 0.4,
            }}
          />
          <span style={{ fontWeight: faIsFocused ? 600 : 400 }}>
            Final
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-[3px] w-3 rounded-full"
            style={{
              backgroundColor: palette.filingLine,
              opacity: filingIsFocused ? 1 : 0.4,
              borderBottom: filingIsFocused
                ? "none"
                : `1px dashed ${palette.filingLine}`,
            }}
          />
          <span style={{ fontWeight: filingIsFocused ? 600 : 400 }}>
            Filing
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-0.5 w-2.5 rounded-full"
            style={{ backgroundColor: palette.pdLine }}
          />
          PD
        </span>
      </motion.div>

      {/* ── Stat Pills ────────────────────────────────────────── */}
      <motion.div
        variants={prefersReduced ? undefined : itemVariants}
        className="grid grid-cols-3 gap-2"
      >
        {/* Gap */}
        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Gap
          </span>
          <span
            className="relative mt-0.5 overflow-hidden text-sm font-bold"
            style={{ color: stageColor }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={gapDays}
                initial={prefersReduced ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-block"
              >
                {isCurrent ? "0d" : `${gapDays.toLocaleString()}d`}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* Velocity */}
        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Avg/Mo
          </span>
          <span
            className="relative mt-0.5 overflow-hidden text-sm font-bold"
            style={{
              color: avgVelocity > 0 ? palette.forward : palette.unchanged,
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={avgVelocity}
                initial={prefersReduced ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-block"
              >
                {avgVelocity > 0 ? `+${avgVelocity}d` : "-"}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        {/* ETA */}
        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Est. ETA
          </span>
          <span
            className="relative mt-0.5 overflow-hidden text-sm font-bold"
            style={{
              color: isCurrent
                ? palette.forward
                : estimatedMonths
                  ? palette.faLine
                  : palette.unchanged,
            }}
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={isCurrent ? "now" : estimatedMonths ?? "none"}
                initial={prefersReduced ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={prefersReduced ? undefined : { y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="inline-block"
              >
                {isCurrent
                  ? "Now"
                  : estimatedMonths
                    ? `~${estimatedMonths} mo`
                    : "-"}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </motion.div>

      {/* ── Current celebration ────────────────────────────────── */}
      <AnimatePresence>
        {isCurrent && (
          <motion.div
            initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              delay: 0.3,
            }}
            className="flex items-center gap-2 rounded-[14px] px-4 py-3"
            style={{
              backgroundColor: `${stageColor}18`,
              border: `1px solid ${stageColor}40`,
            }}
          >
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 20 20"
              fill={stageColor}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <p
              className="text-xs font-semibold leading-relaxed"
              style={{ color: stageColor }}
            >
              Your priority date is current! You may file or expect
              adjudication.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
