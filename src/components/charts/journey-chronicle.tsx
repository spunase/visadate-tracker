"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useThemeStore } from "@/stores/theme-store";

// ─── Types ─────────────────────────────────────────────────────

export interface JourneyChronicleProps {
  data: Array<{
    bulletinMonth: string;
    cutoffDate: string;
    movementDays: number;
    movementDirection: "forward" | "backward" | "unchanged";
  }>;
  category: string;
  country: string;
  chartMode: string;
}

// ─── Country flag gradient colors ──────────────────────────────
// 3 gradient stops derived from each country's flag, tuned for
// legibility on both cream (risograph) and white/dark backgrounds.

interface FlagGradient {
  from: string;
  mid: string;
  to: string;
  /** Primary accent used for area fill wash */
  area: string;
  /** Latest-dot ring color - strongest flag accent */
  dot: string;
  /** Dot glow color */
  dotGlow: string;
}

const flagGradients: Record<string, FlagGradient> = {
  India: {
    from: "#FF9933",   // saffron
    mid: "#000080",    // navy (Ashoka Chakra)
    to: "#138808",     // green
    area: "#FF9933",
    dot: "#FF9933",
    dotGlow: "rgba(255,153,51,0.4)",
  },
  China: {
    from: "#DE2910",   // red
    mid: "#FFDE00",    // gold star
    to: "#DE2910",     // red (mono-flag, bookend)
    area: "#DE2910",
    dot: "#FFDE00",
    dotGlow: "rgba(255,222,0,0.4)",
  },
  Philippines: {
    from: "#0038A8",   // blue
    mid: "#FCD116",    // sun gold
    to: "#CE1126",     // red
    area: "#0038A8",
    dot: "#FCD116",
    dotGlow: "rgba(252,209,22,0.4)",
  },
  Mexico: {
    from: "#006847",   // green
    mid: "#FFFFFF",    // white center
    to: "#CE1126",     // red
    area: "#006847",
    dot: "#CE1126",
    dotGlow: "rgba(206,17,38,0.4)",
  },
  "All Other": {
    from: "#2F6BFF",   // calm blue
    mid: "#0EA5A4",    // teal
    to: "#5B8CFF",     // light blue
    area: "#2F6BFF",
    dot: "#2F6BFF",
    dotGlow: "rgba(47,107,255,0.4)",
  },
};

/** Resolve the flag gradient for a given country string */
function getFlagGradient(country: string): FlagGradient {
  return flagGradients[country] ?? flagGradients["All Other"];
}

// ─── Theme palettes (non-gradient tokens) ──────────────────────

const palettes = {
  risograph: {
    forward: "#4AADA3",
    backward: "#CF7B73",
    unchanged: "#D1CABD",
    ghostLine: "rgba(209,202,189,0.25)",
    axisText: "#8A847E",
    tooltipBg: "#FAF5ED",
    tooltipBorder: "#D1CABD",
    tooltipText: "#2D2B2A",
    tooltipMuted: "#6B6560",
  },
  "quiet-clarity": {
    forward: "#059669",
    backward: "#E11D48",
    unchanged: "#6B7280",
    ghostLine: "rgba(229,231,235,0.35)",
    axisText: "#6B7280",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E7EB",
    tooltipText: "#111827",
    tooltipMuted: "#6B7280",
  },
} as const;

// ─── Helpers ───────────────────────────────────────────────────

function formatMonthAbbr(iso: string): string {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function formatMonthFull(iso: string): string {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatCutoffDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function cutoffToTimestamp(iso: string): number {
  return new Date(iso).getTime();
}

function formatAxisDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function movementLabel(days: number, direction: string): string {
  if (direction === "unchanged") return "No movement";
  const sign = direction === "forward" ? "+" : "-";
  const abs = Math.abs(days);
  return `${sign}${abs} day${abs !== 1 ? "s" : ""}`;
}

// ─── Minimal dot - only renders for latest point ───────────────

interface LatestDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: { isLast: boolean };
}

function makeLatestDot(flag: FlagGradient) {
  return function LatestDotRenderer(props: LatestDotProps) {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload?.isLast) return null;

    return (
      <g>
        {/* Outer glow ring - pulsing */}
        <circle cx={cx} cy={cy} r={12} fill="none" stroke={flag.dot} strokeWidth={1.5} opacity={0.4}>
          <animate attributeName="r" values="10;14;10" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Glow bloom */}
        <circle cx={cx} cy={cy} r={8} fill={flag.dotGlow} opacity={0.5} />

        {/* Solid dot */}
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={flag.dot}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
        />
      </g>
    );
  };
}

// ─── Active dot - appears on hover/tap ─────────────────────────

function makeActiveDot(palette: (typeof palettes)[keyof typeof palettes]) {
  return function ActiveDotRenderer(props: {
    cx?: number;
    cy?: number;
    payload?: { direction: string };
  }) {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null) return null;

    const color =
      payload?.direction === "forward"
        ? palette.forward
        : payload?.direction === "backward"
          ? palette.backward
          : palette.unchanged;

    return (
      <g>
        {/* Glow bloom */}
        <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.15} />
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={6} fill="none" stroke={color} strokeWidth={2} opacity={0.5} />
        {/* Core dot */}
        <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="rgba(255,255,255,0.85)" strokeWidth={1.5} />
      </g>
    );
  };
}

// ─── Custom tooltip ────────────────────────────────────────────

interface TooltipPayloadEntry {
  payload: {
    monthLabel: string;
    cutoffLabel: string;
    movementDays: number;
    direction: string;
  };
}

interface ChronicleTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  palette: (typeof palettes)[keyof typeof palettes];
}

function ChronicleTooltip({ active, payload, palette }: ChronicleTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isRetrogression = d.direction === "backward";
  const isForward = d.direction === "forward";

  const movementColor = isForward
    ? palette.forward
    : isRetrogression
      ? palette.backward
      : palette.unchanged;

  return (
    <div
      className="max-w-[240px] rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm"
      style={{
        backgroundColor: palette.tooltipBg + "EE",
        borderColor: isRetrogression ? palette.backward + "60" : palette.tooltipBorder,
      }}
    >
      <p
        className="font-heading text-sm font-semibold"
        style={{ color: palette.tooltipText }}
      >
        {d.monthLabel}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: palette.tooltipMuted }}>
        Cutoff: {d.cutoffLabel}
      </p>
      <p className="mt-1.5 text-sm font-bold" style={{ color: movementColor }}>
        {movementLabel(d.movementDays, d.direction)}
      </p>
      {isRetrogression && (
        <p
          className="mt-2 border-t pt-2 text-[10px] leading-relaxed"
          style={{
            borderColor: palette.backward + "30",
            color: palette.tooltipMuted,
          }}
        >
          A temporary setback - recovery typically follows within 2-4 months.
        </p>
      )}
    </div>
  );
}

// ─── Stat pills ────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: string;
  color: string;
}

function StatPill({ label, value, color }: StatPillProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/50 px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 text-sm font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// ─── CSS keyframes for reduced-motion ──────────────────────────

const reducedMotionCSS = `
@media (prefers-reduced-motion: reduce) {
  .journey-chronicle-chart animate {
    animation: none !important;
  }
}
`;

// ─── Main component ────────────────────────────────────────────

export function JourneyChronicle({
  data,
  category,
  country,
  chartMode,
}: JourneyChronicleProps) {
  const theme = useThemeStore((s) => s.theme);
  const palette = palettes[theme] ?? palettes["quiet-clarity"];
  const flag = getFlagGradient(country);

  if (!data.length) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No data available for the selected filters.
      </p>
    );
  }

  // Detect "current" categories
  const allCurrent = data.every(
    (d) => d.cutoffDate === "current" || d.movementDays === 0,
  );
  if (allCurrent && data[0]?.cutoffDate === "current") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          {category} {country} is current
        </p>
        <p className="max-w-[260px] text-xs leading-relaxed text-muted-foreground">
          No backlog exists - all eligible applicants can proceed immediately.
          There are no priority date movements to chart.
        </p>
      </div>
    );
  }

  // ─── Compute chart data ────────────────────────────────────
  const chartData = data.map((d, i) => ({
    month: formatMonthAbbr(d.bulletinMonth),
    monthLabel: formatMonthFull(d.bulletinMonth),
    cutoff: cutoffToTimestamp(d.cutoffDate),
    cutoffLabel: formatCutoffDate(d.cutoffDate),
    direction: d.movementDirection,
    movementDays: d.movementDays,
    isLast: i === data.length - 1,
  }));

  const timestamps = chartData.map((d) => d.cutoff);
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  const padding = (maxTs - minTs) * 0.08 || 86400000 * 30;

  // ─── Compute stats ─────────────────────────────────────────
  const forwardEntries = data.filter((d) => d.movementDirection === "forward");
  const backwardEntries = data.filter((d) => d.movementDirection === "backward");

  const netDays = data.reduce((sum, d) => {
    if (d.movementDirection === "backward") return sum - Math.abs(d.movementDays);
    if (d.movementDirection === "forward") return sum + d.movementDays;
    return sum;
  }, 0);

  const avgForward =
    forwardEntries.length > 0
      ? Math.round(
          forwardEntries.reduce((s, d) => s + d.movementDays, 0) /
            forwardEntries.length,
        )
      : 0;

  // Forward streak: count consecutive forward months from latest
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].movementDirection === "forward") streak++;
    else break;
  }

  const netDirection = netDays >= 0 ? "forward" : "backward";
  const netColor =
    netDirection === "forward" ? palette.forward : palette.backward;

  // ─── Accessibility label ───────────────────────────────────
  const ariaLabel = `Unified chart showing ${category} ${country} ${chartMode} priority date trends and monthly movement over ${data.length} months. Net movement: ${netDays >= 0 ? "+" : ""}${netDays} days.`;

  // Unique gradient IDs to avoid conflicts when multiple charts render
  const gradId = `chronicle-line-${category}-${country}`.replace(/\s+/g, "-");
  const areaGradId = `chronicle-area-${category}-${country}`.replace(/\s+/g, "-");

  return (
    <div className="journey-chronicle-chart space-y-4">
      <style dangerouslySetInnerHTML={{ __html: reducedMotionCSS }} />

      <div role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 12, bottom: 4, left: 4 }}
          >
            <defs>
              {/* Horizontal gradient for the main line - flag colors */}
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={flag.from} />
                <stop offset="50%" stopColor={flag.mid} />
                <stop offset="100%" stopColor={flag.to} />
              </linearGradient>

              {/* Vertical gradient for area fill - flag primary */}
              <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={flag.area} stopOpacity={0.14} />
                <stop offset="100%" stopColor={flag.area} stopOpacity={0.01} />
              </linearGradient>

              {/* Glow filter for the main line */}
              <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: palette.axisText }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[minTs - padding, maxTs + padding]}
              tickFormatter={formatAxisDate}
              tick={{ fontSize: 10, fill: palette.axisText }}
              axisLine={false}
              tickLine={false}
              width={52}
            />

            <Tooltip
              content={<ChronicleTooltip palette={palette} />}
              cursor={{ stroke: palette.axisText, strokeDasharray: "4 4", strokeWidth: 1, opacity: 0.3 }}
            />

            {/* Area fill - soft gradient wash beneath the line */}
            <Area
              type="monotone"
              dataKey="cutoff"
              fill={`url(#${areaGradId})`}
              stroke="none"
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* Ghost reference line - subtle shadow of the main path */}
            <Line
              type="monotone"
              dataKey="cutoff"
              stroke={palette.ghostLine}
              strokeWidth={4}
              strokeLinecap="round"
              dot={false}
              activeDot={false}
              animationDuration={1400}
              animationEasing="ease-out"
            />

            {/* Main flowing line - thick, gradient-stroked, no dots */}
            <Line
              type="monotone"
              dataKey="cutoff"
              stroke={`url(#${gradId})`}
              strokeWidth={3}
              strokeLinecap="round"
              filter={`url(#${gradId}-glow)`}
              dot={makeLatestDot(flag)}
              activeDot={makeActiveDot(palette)}
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Screen reader data */}
        <p className="sr-only">
          {category} {country} {chartMode} dates:{" "}
          {data
            .map(
              (d) =>
                `${formatMonthFull(d.bulletinMonth)}: ${formatCutoffDate(d.cutoffDate)} (${movementLabel(d.movementDays, d.movementDirection)})`,
            )
            .join(". ")}
        </p>
      </div>

      {/* ─── Legend ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-5 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: `linear-gradient(90deg, ${flag.from}, ${flag.mid}, ${flag.to})` }} />
          Trend
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ backgroundColor: palette.ghostLine }} />
          Baseline
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-full border-2"
            style={{ borderColor: flag.dot, boxShadow: `0 0 4px ${flag.dotGlow}` }}
          />
          Latest
        </span>
      </div>

      {/* ─── Stat pills ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill
          label="Net"
          value={`${netDays >= 0 ? "+" : ""}${netDays}d`}
          color={netColor}
        />
        <StatPill
          label="Avg/Mo"
          value={avgForward > 0 ? `+${avgForward}d` : "-"}
          color={palette.forward}
        />
        <StatPill
          label="Streak"
          value={
            streak > 0
              ? `${streak} mo${streak > 1 ? "s" : ""} ↑`
              : backwardEntries.length > 0
                ? `${backwardEntries.length} retro`
                : "-"
          }
          color={streak > 0 ? palette.forward : palette.backward}
        />
      </div>
    </div>
  );
}
