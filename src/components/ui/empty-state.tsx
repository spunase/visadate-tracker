"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Optional custom icon — defaults to the built-in compass SVG */
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

// ─── Keyframes ─────────────────────────────────────────────────

const keyframesCSS = `
@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
@keyframes empty-pulse-ring {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.08); }
}
@keyframes empty-beacon {
  0%   { opacity: 0.7; r: 3; }
  50%  { opacity: 1;   r: 4.5; }
  100% { opacity: 0.7; r: 3; }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state-illustration,
  .empty-state-illustration * {
    animation: none !important;
    transition: none !important;
  }
}
`;

// ─── Default compass SVG ───────────────────────────────────────

function CompassIllustration() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="overflow-visible"
    >
      {/* Outer pulsing ring */}
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="#2F6BFF"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.25"
        style={{ animation: "empty-pulse-ring 3s ease-in-out infinite" }}
      />

      {/* Compass body */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="currentColor"
        className="text-slate-100 dark:text-slate-800"
      />
      <circle
        cx="40"
        cy="40"
        r="28"
        stroke="#2F6BFF"
        strokeWidth="2"
        opacity="0.4"
      />

      {/* Cardinal markers */}
      <line x1="40" y1="14" x2="40" y2="20" stroke="#2F6BFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="40" y1="60" x2="40" y2="66" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="14" y1="40" x2="20" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="60" y1="40" x2="66" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Compass needle — North (blue) */}
      <polygon points="40,18 36,40 44,40" fill="#2F6BFF" opacity="0.85" />
      {/* Compass needle — South (muted) */}
      <polygon points="40,62 36,40 44,40" fill="#cbd5e1" className="dark:fill-slate-600" opacity="0.6" />

      {/* Center beacon */}
      <circle
        cx="40"
        cy="40"
        r="3"
        fill="#2F6BFF"
        style={{ animation: "empty-beacon 2.5s ease-in-out infinite" }}
      />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 px-6 py-12 text-center",
        className,
      )}
      role="status"
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      {/* Illustration */}
      <div
        className="empty-state-illustration"
        style={{ animation: "empty-float 4s ease-in-out infinite" }}
      >
        {icon ?? <CompassIllustration />}
      </div>

      {/* Copy */}
      <div className="flex max-w-xs flex-col gap-1.5">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Action */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:ring-3 focus-visible:ring-[#2F6BFF]/40 focus-visible:outline-none active:translate-y-px"
          style={{ backgroundColor: "#2F6BFF" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
