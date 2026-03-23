"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
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
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-foreground">{d.monthLabel}</p>
      <p className="text-xs text-muted-foreground">{d.cutoffLabel}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        {movementLabel(d.movementDays, d.direction)}
      </p>
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
