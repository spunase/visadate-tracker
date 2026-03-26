"use client";

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export type VelocityDirection = "forward" | "backward" | "none";
export type VelocitySize = "sm" | "md" | "lg";

export interface VelocityArcProps {
  /** Direction of movement - determines icon, color, and motion */
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
  {
    container: number;
    icon: number;
    strokeWidth: number;
    textClass: string;
    ringSize: number;
  }
> = {
  sm: { container: 32, icon: 16, strokeWidth: 2, textClass: "text-[11px]", ringSize: 32 },
  md: { container: 40, icon: 20, strokeWidth: 2.5, textClass: "text-caption", ringSize: 40 },
  lg: { container: 48, icon: 24, strokeWidth: 2.5, textClass: "text-sm", ringSize: 48 },
};

// ─── Color tokens (Material Design 3 tonal palette approach) ──

const colorTokens = {
  forward: {
    // Emerald / green tonal
    containerBg: "bg-emerald-50 dark:bg-emerald-950/40",
    containerBorder: "border-emerald-200/60 dark:border-emerald-800/40",
    iconColor: "#059669",
    iconColorDark: "#34D399",
    ringColor: "rgba(5,150,105,0.12)",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  backward: {
    // Rose / red tonal
    containerBg: "bg-rose-50 dark:bg-rose-950/40",
    containerBorder: "border-rose-200/60 dark:border-rose-800/40",
    iconColor: "#E11D48",
    iconColorDark: "#FB7185",
    ringColor: "rgba(225,29,72,0.12)",
    textColor: "text-rose-700 dark:text-rose-400",
  },
  none: {
    // Neutral / gray tonal
    containerBg: "bg-gray-100 dark:bg-gray-800/40",
    containerBorder: "border-gray-200/60 dark:border-gray-700/40",
    iconColor: "#6B7280",
    iconColorDark: "#9CA3AF",
    ringColor: "rgba(107,114,128,0.10)",
    textColor: "text-gray-500 dark:text-gray-400",
  },
};

// ─── Keyframes ────────────────────────────────────────────────

const keyframesCSS = `
@keyframes velocity-breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%      { transform: scale(1.15); opacity: 0; }
}
@keyframes velocity-float-up {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1.5px); }
}
@keyframes velocity-float-down {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(1.5px); }
}
@keyframes velocity-pulse-dot {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .velocity-indicator,
  .velocity-indicator * {
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
  const { container, icon, strokeWidth, textClass, ringSize } = sizeConfig[size];
  const colors = colorTokens[direction];

  const ariaLabel = movement
    ? `Movement ${direction}: ${movement}`
    : `Movement: ${direction}`;

  return (
    <span
      className={cn(
        "velocity-indicator inline-flex flex-col items-center gap-1",
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      {/* Tonal container - Material Design 3 filled tonal style */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border",
          colors.containerBg,
          colors.containerBorder,
        )}
        style={{ width: ringSize, height: ringSize }}
      >
        {/* Breathing ring - subtle expanding halo (forward/backward only) */}
        {direction !== "none" && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: `1.5px solid ${direction === "forward" ? colorTokens.forward.iconColor : colorTokens.backward.iconColor}`,
              animation: "velocity-breathe 2.5s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
        )}

        {/* SVG Icon */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{
            animation:
              direction === "forward"
                ? "velocity-float-up 2s ease-in-out infinite"
                : direction === "backward"
                  ? "velocity-float-down 2s ease-in-out infinite"
                  : undefined,
          }}
        >
          {direction === "forward" && (
            <>
              {/* Upward bold arrow - Material Symbols Rounded "arrow_upward" style */}
              {/* Clean, bold, unmistakable upward direction */}
              <path
                d="M12 4L12 20"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-emerald-600 dark:text-emerald-400"
              />
              <path
                d="M5 11L12 4L19 11"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="text-emerald-600 dark:text-emerald-400"
              />
            </>
          )}

          {direction === "backward" && (
            <>
              {/* Downward bold arrow - Material Symbols Rounded "arrow_downward" style */}
              <path
                d="M12 4L12 20"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-rose-600 dark:text-rose-400"
              />
              <path
                d="M5 13L12 20L19 13"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="text-rose-600 dark:text-rose-400"
              />
            </>
          )}

          {direction === "none" && (
            <>
              {/* Horizontal line with dots - "no change" indicator */}
              <line
                x1="6"
                y1="12"
                x2="18"
                y2="12"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-gray-400 dark:text-gray-500"
              />
              {/* Leading dot */}
              <circle
                cx="6"
                cy="12"
                r="1.5"
                fill="currentColor"
                className="text-gray-400 dark:text-gray-500"
                style={{ animation: "velocity-pulse-dot 2s ease-in-out infinite" }}
              />
              {/* Trailing dot */}
              <circle
                cx="18"
                cy="12"
                r="1.5"
                fill="currentColor"
                className="text-gray-400 dark:text-gray-500"
                style={{ animation: "velocity-pulse-dot 2s ease-in-out infinite 0.5s" }}
              />
            </>
          )}
        </svg>
      </span>

      {/* Movement label - Material Design typography */}
      {movement && (
        <span
          className={cn(
            "font-semibold leading-none tracking-tight",
            textClass,
            colors.textColor,
          )}
        >
          {movement}
        </span>
      )}
    </span>
  );
}
