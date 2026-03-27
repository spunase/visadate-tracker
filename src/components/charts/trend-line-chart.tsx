"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { colors } from "@/lib/design-tokens";

// ─── Types ─────────────────────────────────────────────────────

export interface TrendLineChartProps {
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

// ─── Helpers ────────────────────────────────────────────────────

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
  return `${sign}${abs} day${abs !== 1 ? "s" : ""} ${direction}`;
}

// ─── Dot colors ─────────────────────────────────────────────────

const dotColorMap: Record<string, string> = {
  forward: colors.light.successEmerald,
  backward: colors.light.alertRose,
  unchanged: "#6B7280",
};

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    direction: string;
  };
}

function DirectionDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  const color = dotColorMap[payload.direction] ?? "#6B7280";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke="#fff"
      strokeWidth={1.5}
    />
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────

interface TooltipPayloadEntry {
  payload: {
    monthLabel: string;
    cutoffLabel: string;
    movementDays: number;
    direction: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isRetrogression = d.direction === "backward";
  return (
    <div
      className={`max-w-[220px] rounded-lg border px-3 py-2 shadow-md ${
        isRetrogression
          ? "border-rose-200/60 bg-gradient-to-br from-rose-50 to-rose-100/60 dark:border-rose-800/40 dark:from-rose-950/80 dark:to-rose-900/40"
          : "border-border/50 bg-background"
      }`}
    >
      <p className="text-xs font-semibold text-foreground">{d.monthLabel}</p>
      <p className="text-xs text-muted-foreground">{d.cutoffLabel}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        {movementLabel(d.movementDays, d.direction)}
      </p>
      {isRetrogression && (
        <p className="mt-1.5 border-t border-rose-200/40 pt-1.5 text-[10px] leading-relaxed text-muted-foreground dark:border-rose-800/30">
          A temporary setback - retrogressions are typically followed by recovery
          within 2-4 months.
        </p>
      )}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function TrendLineChart({
  data,
  category,
  country,
  chartMode,
}: TrendLineChartProps) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        No data available for the selected filters.
      </p>
    );
  }

  // Detect "current" categories - no backlog, no dates to chart
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
          No backlog exists for this category - all eligible applicants can
          proceed immediately. There are no priority date movements to chart.
        </p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    month: formatMonthAbbr(d.bulletinMonth),
    monthLabel: formatMonthFull(d.bulletinMonth),
    cutoff: cutoffToTimestamp(d.cutoffDate),
    cutoffLabel: formatCutoffDate(d.cutoffDate),
    direction: d.movementDirection,
    movementDays: d.movementDays,
  }));

  const timestamps = chartData.map((d) => d.cutoff);
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  const padding = (maxTs - minTs) * 0.05 || 86400000 * 30;

  const ariaLabel = `Line chart showing ${category} ${country} ${chartMode} priority date trends over ${data.length} months`;

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={colors.light.calmBlue}
                stopOpacity={0.1}
              />
              <stop
                offset="100%"
                stopColor={colors.light.calmBlue}
                stopOpacity={0.01}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minTs - padding, maxTs + padding]}
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 10, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#D1D5DB", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="cutoff"
            fill="url(#trendFill)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="cutoff"
            stroke={colors.light.calmBlue}
            strokeWidth={2}
            dot={<DirectionDot />}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
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
  );
}
