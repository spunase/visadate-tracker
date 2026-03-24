"use client";

import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface HopeContextProps {
  direction: "forward" | "backward" | "none";
  category: string;
  movement: string;
  className?: string;
}

// ─── Direction config ──────────────────────────────────────────

interface DirectionConfig {
  gradient: string;
  iconColor: string;
  getMessage: (category: string, movement: string) => { headline: string; body: string };
}

const directionConfig: Record<HopeContextProps["direction"], DirectionConfig> = {
  forward: {
    gradient:
      "bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/10",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    getMessage: (category, movement) => ({
      headline: "Progress in motion",
      body: `The ${category} category has moved forward by ${movement}. Historically, forward momentum in this category tends to continue across subsequent bulletins. This is a meaningful step, and your patience is paying off.`,
    }),
  },
  backward: {
    gradient:
      "bg-gradient-to-br from-rose-50/80 to-rose-100/40 dark:from-rose-950/30 dark:to-rose-900/10",
    iconColor: "text-rose-500 dark:text-rose-400",
    getMessage: (category, movement) => ({
      headline: "A temporary setback",
      body: `The ${category} category retrogressed by ${movement}. While any backward movement can feel discouraging, historical patterns show that retrogressions are typically followed by recovery within 2-4 months. This is a normal part of the process, not a permanent change.`,
    }),
  },
  none: {
    gradient:
      "bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-900/10",
    iconColor: "text-amber-500 dark:text-amber-400",
    getMessage: (category) => ({
      headline: "Holding steady",
      body: `The ${category} category didn't move this month, but that's more common than you'd think. Periods of stability often precede significant forward jumps. Your place in line hasn't changed, and the underlying demand trends remain favorable.`,
    }),
  },
};

// ─── Insight icon (sparkle / lightbulb) ────────────────────────

function InsightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sparkle / star shape */}
      <path
        d="M9 1.5L10.3 6.7L15.5 5.5L11.5 9L15.5 12.5L10.3 11.3L9 16.5L7.7 11.3L2.5 12.5L6.5 9L2.5 5.5L7.7 6.7L9 1.5Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

// ─── Keyframes ─────────────────────────────────────────────────

const keyframesCSS = `
@keyframes hope-icon-glow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .hope-context-icon {
    animation: none !important;
  }
}
`;

// ─── Component ─────────────────────────────────────────────────

export function HopeContext({
  direction,
  category,
  movement,
  className,
}: HopeContextProps) {
  const config = directionConfig[direction];
  const { headline, body } = config.getMessage(category, movement);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[18px] p-4 ring-1 ring-foreground/5",
        config.gradient,
        className,
      )}
      role="note"
      aria-label={`${headline}: ${body}`}
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="hope-context-icon mt-0.5 shrink-0"
          style={{ animation: "hope-icon-glow 3s ease-in-out infinite" }}
        >
          <InsightIcon className={config.iconColor} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="font-heading text-sm font-semibold text-foreground">
            {headline}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
