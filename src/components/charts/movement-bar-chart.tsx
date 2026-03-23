"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { colors } from "@/lib/design-tokens";

// ─── Types ─────────────────────────────────────────────────────

export interface MovementBarChartProps {
  data: Array<{
    bulletinMonth: string;
    movementDays: number;
    movementDirection: "forward" | "backward" | "unchanged";
  }>;
}

// ─── Helpers ────────────────────────────────────────────────────

function formatMonthAbbr(iso: string): string {
  const d = new Date(iso + "-01");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const barColorMap: Record<string, string> = {
  forward: colors.light.successEmerald,
  backward: colors.light.alertRose,
  unchanged: "#9CA3AF",
};

// ─── Custom Tooltip ─────────────────────────────────────────────

interface TooltipPayloadEntry {
  payload: {
    month: string;
    days: number;
    direction: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function BarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sign = d.direction === "backward" ? "-" : "+";
  const label =
    d.direction === "unchanged"
      ? "No movement"
      : `${sign}${Math.abs(d.days)} day${Math.abs(d.days) !== 1 ? "s" : ""}`;

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-1.5 shadow-md">
      <p className="text-[11px] font-semibold text-foreground">{d.month}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function MovementBarChart({ data }: MovementBarChartProps) {
  if (!data.length) return null;

  const chartData = data.map((d) => ({
    month: formatMonthAbbr(d.bulletinMonth),
    days:
      d.movementDirection === "backward"
        ? -Math.abs(d.movementDays)
        : d.movementDays,
    direction: d.movementDirection,
  }));

  const ariaLabel = `Bar chart showing monthly movement in days: ${chartData
    .map((d) => {
      const sign = d.direction === "backward" ? "-" : "+";
      return `${d.month}: ${d.direction === "unchanged" ? "no change" : `${sign}${Math.abs(d.days)} days`}`;
    })
    .join(", ")}`;

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
        >
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <ReferenceLine y={0} stroke="#E5E7EB" />
          <Tooltip
            content={<BarTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="days" radius={[3, 3, 0, 0]} maxBarSize={24}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={barColorMap[entry.direction] ?? "#9CA3AF"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="sr-only">{ariaLabel}</p>
    </div>
  );
}
