"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Line,
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

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((toTs(a) - toTs(b)) / msPerDay);
}

// ─── Movement footstep dot ─────────────────────────────────────

interface FootstepDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    filingDirection?: HistoryEntry["movementDirection"];
    filingMovement?: number;
    isLast?: boolean;
  };
  palette: (typeof palettes)[keyof typeof palettes];
}

function FilingFootstepDot({ cx, cy, payload, palette }: FootstepDotProps) {
  if (cx == null || cy == null || !payload?.filingDirection) return null;

  const { filingDirection, filingMovement = 0, isLast } = payload;
  const color =
    filingDirection === "forward"
      ? palette.forward
      : filingDirection === "backward"
        ? palette.backward
        : palette.unchanged;

  const r = Math.min(6, Math.max(3, Math.abs(filingMovement) / 15 + 3));

  return (
    <g>
      {/* Outer ring on latest */}
      {isLast && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 3}
          fill="none"
          stroke={palette.pdLine}
          strokeWidth={1.5}
          opacity={0.6}
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Main dot */}
      <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.85} />
      {/* Direction indicator */}
      {r >= 4 && filingDirection === "forward" && (
        <path
          d={`M${cx} ${cy - r * 0.45} L${cx - r * 0.3} ${cy + r * 0.2} L${cx + r * 0.3} ${cy + r * 0.2} Z`}
          fill="white"
          opacity={0.8}
        />
      )}
      {r >= 4 && filingDirection === "backward" && (
        <path
          d={`M${cx} ${cy + r * 0.45} L${cx - r * 0.3} ${cy - r * 0.2} L${cx + r * 0.3} ${cy - r * 0.2} Z`}
          fill="white"
          opacity={0.8}
        />
      )}
    </g>
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
}

function ConvergenceTooltip({
  active,
  payload,
  palette,
  pdLabel,
}: ConvergenceTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  const movLabel = (days: number | undefined, dir: string | undefined) => {
    if (!dir || dir === "unchanged") return "No change";
    const sign = dir === "forward" ? "+" : "-";
    const abs = Math.abs(days ?? 0);
    return `${sign}${abs}d`;
  };

  return (
    <div
      className="max-w-[260px] rounded-xl border-2 px-4 py-3 shadow-lg"
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

      {d.faLabel && (
        <p className="mt-1 text-xs" style={{ color: palette.tooltipMuted }}>
          <span
            className="mr-1.5 inline-block size-2 rounded-full"
            style={{ backgroundColor: palette.faLine }}
          />
          Final Action: {d.faLabel}{" "}
          <span style={{ color: palette.faLine, fontWeight: 600 }}>
            {movLabel(d.faMovement, d.faDirection)}
          </span>
        </p>
      )}

      {d.filingLabel && (
        <p className="mt-1 text-xs" style={{ color: palette.tooltipMuted }}>
          <span
            className="mr-1.5 inline-block size-2 rounded-full"
            style={{ backgroundColor: palette.filingLine }}
          />
          Filing: {d.filingLabel}{" "}
          <span style={{ color: palette.filingLine, fontWeight: 600 }}>
            {movLabel(d.filingMovement, d.filingDirection)}
          </span>
        </p>
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
    <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: palette.meterTrack }}>
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
      {/* Glow pulse at the leading edge when intensity > 0.6 */}
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
    // Get latest cutoff dates
    const latestFA =
      finalActionHistory.length > 0
        ? finalActionHistory[finalActionHistory.length - 1]
        : null;
    const latestFiling =
      filingHistory.length > 0
        ? filingHistory[filingHistory.length - 1]
        : null;

    // Determine effective date (whichever cutoff is closer/later = closer to PD)
    const faTs = latestFA ? toTs(latestFA.cutoffDate) : 0;
    const filTs = latestFiling ? toTs(latestFiling.cutoffDate) : 0;
    const pdTimestamp = toTs(priorityDate);

    // The "effective" cutoff is whichever is closer to (but not past) the PD
    // In visa terms, the later cutoff date is closer to the priority date
    const effectiveTs = Math.max(faTs, filTs);
    const effType = faTs >= filTs ? "Final Action" : "Filing";
    const effLabel =
      effType === "Final Action" && latestFA
        ? formatDateShort(latestFA.cutoffDate)
        : latestFiling
          ? formatDateShort(latestFiling.cutoffDate)
          : "—";

    // Gap calculation
    const gapMs = pdTimestamp - effectiveTs;
    const gapD = Math.max(0, Math.round(gapMs / 86_400_000));

    // Intensity: 0 (far) → 1 (current), over a 2-year range
    const maxRange = 365 * 2;
    const inten = Math.max(0, Math.min(1, 1 - gapD / maxRange));

    const stg = getStage(gapD);

    // Build unified chart data — merge FA and Filing by bulletinMonth
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

    // Sort by bulletinMonth
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

    // Y-axis range
    const allTs = cData.flatMap((d) =>
      [d.faCutoff, d.filingCutoff].filter((v): v is number => v != null),
    );
    allTs.push(pdTimestamp);
    const minT = Math.min(...allTs);
    const maxT = Math.max(...allTs);
    const pad = (maxT - minT) * 0.08 || 86_400_000 * 30;

    // Average velocity (forward days/month on effective line)
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

    // Estimated months to current
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

  // ── Accessibility ────────────────────────────────────────────
  const ariaLabel = `Convergence timeline for ${category} ${country}. ${
    isCurrent
      ? "Your priority date is current!"
      : `${gapDays} days until your priority date becomes current. Stage: ${stage.label}.`
  } Showing Final Action and Filing cutoff date movements over ${chartData.length} months.`;

  return (
    <motion.div
      variants={prefersReduced ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      aria-label={ariaLabel}
      role="region"
    >
      {/* ── Countdown Header ──────────────────────────────────── */}
      <motion.div
        variants={prefersReduced ? undefined : itemVariants}
        className="flex items-start justify-between gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {isCurrent ? "Status" : "Days Until Current"}
          </p>
          <p className="mt-0.5 tabular-nums text-3xl font-extrabold text-foreground">
            {isCurrent ? (
              <span style={{ color: stageColor }}>Current!</span>
            ) : (
              <motion.span
                key={gapDays}
                initial={prefersReduced ? false : { scale: 1.15, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
              >
                {gapDays.toLocaleString()}
              </motion.span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            via {effectiveType} &middot; {effectiveLabel}
          </p>
        </div>

        {/* Stage badge */}
        <AnimatePresence mode="wait">
          <motion.span
            key={stage.key}
            initial={prefersReduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReduced ? undefined : { scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: stageColor }}
            aria-live="polite"
          >
            {stage.label}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* ── Proximity Meter ───────────────────────────────────── */}
      <motion.div variants={prefersReduced ? undefined : itemVariants}>
        <ProximityMeter
          intensity={intensity}
          palette={palette}
          prefersReduced={prefersReduced}
        />
      </motion.div>

      {/* ── Dual-line Convergence Chart ───────────────────────── */}
      <motion.div variants={prefersReduced ? undefined : itemVariants}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
          >
            <defs>
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
                />
              }
              cursor={{ stroke: palette.grid, strokeDasharray: "3 3" }}
            />

            {/* Priority Date — golden reference line */}
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

            {/* Final Action line */}
            <Line
              type="monotone"
              dataKey="faCutoff"
              stroke={palette.faLine}
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={{ r: 2.5, fill: palette.faLine, strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: palette.faLine,
                stroke: "white",
                strokeWidth: 2,
              }}
              connectNulls
              animationDuration={1400}
              animationEasing="ease-out"
              name="Final Action"
            />

            {/* Filing line with movement footstep dots */}
            <Line
              type="monotone"
              dataKey="filingCutoff"
              stroke={palette.filingLine}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="4 2"
              dot={(props: Record<string, unknown>) => (
                <FilingFootstepDot
                  cx={props.cx as number}
                  cy={props.cy as number}
                  payload={props.payload as FootstepDotProps["payload"]}
                  palette={palette}
                />
              )}
              activeDot={{
                r: 5,
                fill: palette.filingLine,
                stroke: "white",
                strokeWidth: 2,
              }}
              connectNulls
              animationDuration={1600}
              animationEasing="ease-out"
              name="Filing"
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
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-3 rounded-full"
            style={{ backgroundColor: palette.faLine }}
          />
          Final Action
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-3 rounded-full border-b"
            style={{
              borderColor: palette.filingLine,
              borderStyle: "dashed",
            }}
          />
          Filing
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-3 rounded-full"
            style={{
              backgroundColor: palette.pdLine,
              borderStyle: "dashed",
            }}
          />
          Your PD
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: palette.forward }}
          />
          Forward
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: palette.backward }}
          />
          Backward
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
            className="mt-0.5 text-sm font-bold"
            style={{ color: stageColor }}
          >
            {isCurrent ? "0d" : `${gapDays.toLocaleString()}d`}
          </span>
        </div>

        {/* Velocity */}
        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Avg/Mo
          </span>
          <span
            className="mt-0.5 text-sm font-bold"
            style={{ color: avgVelocity > 0 ? palette.forward : palette.unchanged }}
          >
            {avgVelocity > 0 ? `+${avgVelocity}d` : "—"}
          </span>
        </div>

        {/* ETA */}
        <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Est. ETA
          </span>
          <span
            className="mt-0.5 text-sm font-bold"
            style={{
              color: isCurrent
                ? palette.forward
                : estimatedMonths
                  ? palette.faLine
                  : palette.unchanged,
            }}
          >
            {isCurrent
              ? "Now"
              : estimatedMonths
                ? `~${estimatedMonths} mo`
                : "—"}
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
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.3 }}
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
