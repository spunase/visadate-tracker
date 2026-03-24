"use client";

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type VelocityDirection = "forward" | "backward" | "none";
export type VelocitySize = "sm" | "md" | "lg";

export interface VelocityArcProps {
  /** Direction of movement — determines arc shape, color, and animation */
  direction: VelocityDirection;
  /** Human-readable movement label, e.g. "+2 months", "No change" */
  movement?: string;
  /** Visual size preset */
  size?: VelocitySize;
  className?: string;
}

// ─── Size config ──────────────────────────────────────────────

const sizeConfig: Record<
  VelocitySize,
  { width: number; height: number; strokeWidth: number; textClass: string }
> = {
  sm: { width: 48, height: 28, strokeWidth: 2, textClass: "text-tiny" },
  md: { width: 64, height: 36, strokeWidth: 2.5, textClass: "text-caption" },
  lg: { width: 80, height: 44, strokeWidth: 3, textClass: "text-sm" },
};

// ─── Gradient IDs (stable per-direction to avoid SSR mismatch) ─

const gradientIds = {
  forward: "velocity-grad-fwd",
  backward: "velocity-grad-bwd",
  none: "velocity-grad-none",
} as const;

// ─── Keyframes (injected once via <style>) ────────────────────

const keyframesCSS = `
@keyframes velocity-pulse {
  0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 2px currentColor); }
  50%      { opacity: 1;    filter: drop-shadow(0 0 6px currentColor); }
}
@keyframes velocity-shimmer {
  0%   { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}
@keyframes velocity-tip {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(2px); }
}
@keyframes velocity-tip-back {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(-2px); }
}

@media (prefers-reduced-motion: reduce) {
  .velocity-arc-animated,
  .velocity-arc-animated * {
    animation: none !important;
    transition: none !important;
  }
}
`;

// ─── Component ─────────────────────────────────────────────────

export function VelocityArc({
  direction,
  movement,
  size = "md",
  className,
}: VelocityArcProps) {
  const { width, height, strokeWidth, textClass } = sizeConfig[size];
  const gradId = gradientIds[direction];

  // Gradient stops per direction
  const gradientStops = {
    forward: { from: "#34d399", to: "#059669" },   // emerald-400 → emerald-600
    backward: { from: "#fb7185", to: "#e11d48" },  // rose-400 → rose-600
    none: { from: "#cbd5e1", to: "#94a3b8" },      // slate-300 → slate-400
  }[direction];

  // Arc path data
  const arcPath = {
    forward: `M 4 ${height - 6} Q ${width / 2} ${-height * 0.15} ${width - 10} ${height * 0.35}`,
    backward: `M 4 6 Q ${width / 2} ${height * 1.15} ${width - 10} ${height * 0.65}`,
    none: `M 4 ${height / 2} L ${width - 10} ${height / 2}`,
  }[direction];

  // Arrow tip path
  const arrowTip = {
    forward: {
      d: `M ${width - 14} ${height * 0.35 - 4} L ${width - 8} ${height * 0.35} L ${width - 14} ${height * 0.35 + 4}`,
      animation: "velocity-tip 2s ease-in-out infinite",
    },
    backward: {
      d: `M ${width - 14} ${height * 0.65 - 4} L ${width - 8} ${height * 0.65} L ${width - 14} ${height * 0.65 + 4}`,
      animation: "velocity-tip-back 2s ease-in-out infinite",
    },
    none: null,
  }[direction];

  // Animation style for the main arc
  const arcAnimation =
    direction === "none"
      ? { strokeDasharray: "6 6", animation: "velocity-shimmer 1.5s linear infinite" }
      : { animation: "velocity-pulse 2.5s ease-in-out infinite" };

  // ARIA label
  const ariaLabel = movement
    ? `Movement ${direction}: ${movement}`
    : `Movement: ${direction}`;

  return (
    <span
      className={cn(
        "velocity-arc-animated inline-flex flex-col items-center gap-0.5",
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Inject keyframes — React deduplicates identical <style> content */}
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStops.from} />
            <stop offset="100%" stopColor={gradientStops.to} />
          </linearGradient>
        </defs>

        {/* Main arc / line */}
        <path
          d={arcPath}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          style={arcAnimation}
        />

        {/* Arrow tip (forward / backward only) */}
        {arrowTip && (
          <path
            d={arrowTip.d}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth * 0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ animation: arrowTip.animation }}
          />
        )}
      </svg>

      {/* Movement label */}
      {movement && (
        <span
          className={cn(
            "font-medium leading-none transition-colors",
            textClass,
            {
              "text-emerald-600 dark:text-emerald-400": direction === "forward",
              "text-rose-600 dark:text-rose-400": direction === "backward",
              "text-slate-500 dark:text-slate-400": direction === "none",
            },
          )}
        >
          {movement}
        </span>
      )}
    </span>
  );
}
