"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  Copy,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface JourneySnapshotProps {
  category: "EB1" | "EB2" | "EB3";
  country: string;
  priorityDate: string;
  currentFinalAction: string;
  movement: string;
  direction: "forward" | "backward" | "none";
  bulletinMonth: string;
}

// ─── Constants ─────────────────────────────────────────────────

const categoryGradients: Record<string, string> = {
  EB1: "from-[#1B4FCC] via-[#2F6BFF] to-[#0B1020]",
  EB2: "from-[#1a3a6e] via-[#1B4FCC] to-[#0B1020]",
  EB3: "from-[#0d2b5e] via-[#163a7a] to-[#0B1020]",
};

const directionConfig = {
  forward: {
    headline: "Moving Forward!",
    subtext: "Progress This Month",
    color: "text-[#34D399]",
    glowColor: "shadow-[0_0_24px_rgba(52,211,153,0.35)]",
    bgAccent: "bg-[#059669]/15",
    borderAccent: "border-[#059669]/30",
    icon: TrendingUp,
    dotPulse: "bg-[#34D399]",
  },
  backward: {
    headline: "Retrogression Alert",
    subtext: "Dates Moved Back",
    color: "text-[#FB7185]",
    glowColor: "shadow-[0_0_24px_rgba(225,29,72,0.35)]",
    bgAccent: "bg-[#E11D48]/15",
    borderAccent: "border-[#E11D48]/30",
    icon: TrendingDown,
    dotPulse: "bg-[#FB7185]",
  },
  none: {
    headline: "Holding Steady",
    subtext: "No Movement This Month",
    color: "text-slate-300",
    glowColor: "shadow-[0_0_24px_rgba(148,163,184,0.15)]",
    bgAccent: "bg-slate-500/15",
    borderAccent: "border-slate-500/30",
    icon: Minus,
    dotPulse: "bg-slate-400",
  },
} as const;

// ─── Background Pattern ────────────────────────────────────────

function GridPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="snapshot-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 32V0h32"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#snapshot-grid)" />
    </svg>
  );
}

// ─── Share Button ──────────────────────────────────────────────

interface ShareButtonProps {
  snapshotRef: React.RefObject<HTMLDivElement | null>;
  category: string;
  country: string;
  movement: string;
  direction: "forward" | "backward" | "none";
  bulletinMonth: string;
}

function ShareButton({
  snapshotRef,
  category,
  country,
  movement,
  direction,
  bulletinMonth,
}: ShareButtonProps) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">(
    "idle",
  );

  const shareText = `${directionConfig[direction].headline} ${category} ${country}: ${movement} (${bulletinMonth} Visa Bulletin) - tracked on VisaDateTracker`;

  const handleShare = useCallback(async () => {
    // Try Web Share API first
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        // Attempt image share if html-to-image is available
        let files: File[] | undefined;
        if (snapshotRef.current) {
          try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(snapshotRef.current, {
              pixelRatio: 2,
              cacheBust: true,
            });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            files = [
              new File([blob], "visa-journey-snapshot.png", {
                type: "image/png",
              }),
            ];
          } catch {
            // Fall through to text-only share
          }
        }

        await navigator.share({
          text: shareText,
          ...(files?.length ? { files } : {}),
        });
        setShareState("shared");
      } catch (err) {
        // User cancelled or API failed — fall back to clipboard
        if ((err as DOMException)?.name !== "AbortError") {
          await copyToClipboard();
        }
        return;
      }
    } else {
      await copyToClipboard();
    }

    setTimeout(() => setShareState("idle"), 2500);

    async function copyToClipboard() {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 2500);
      } catch {
        // Clipboard API not available
      }
    }
  }, [shareText, snapshotRef]);

  return (
    <motion.button
      onClick={handleShare}
      className={cn(
        "mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3",
        "bg-white/10 font-semibold text-white backdrop-blur-sm",
        "border border-white/10 transition-colors hover:bg-white/15",
        "cursor-pointer select-none",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      aria-label="Share your journey snapshot"
    >
      <AnimatePresence mode="wait">
        {shareState === "idle" && (
          <motion.span
            key="share"
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <Share2 className="size-4" />
            Share Snapshot
          </motion.span>
        )}
        {shareState === "copied" && (
          <motion.span
            key="copied"
            className="flex items-center gap-2 text-[#34D399]"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <Copy className="size-4" />
            Copied to Clipboard!
          </motion.span>
        )}
        {shareState === "shared" && (
          <motion.span
            key="shared"
            className="flex items-center gap-2 text-[#34D399]"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <Check className="size-4" />
            Shared!
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────

export function JourneySnapshot({
  category,
  country,
  priorityDate,
  currentFinalAction,
  movement,
  direction,
  bulletinMonth,
}: JourneySnapshotProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const config = directionConfig[direction];
  const DirectionIcon = config.icon;

  return (
    <div className="flex flex-col items-center">
      {/* Snapshot card — 4:5 aspect ratio (optimal for Instagram/social) */}
      <motion.div
        ref={cardRef}
        className={cn(
          "relative w-[360px] overflow-hidden rounded-2xl",
          "bg-gradient-to-br",
          categoryGradients[category] ?? categoryGradients.EB2,
          "border border-white/[0.08]",
          config.glowColor,
        )}
        style={{ aspectRatio: "4 / 5" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Background texture */}
        <GridPattern />

        {/* Radial glow accent */}
        <div
          className="pointer-events-none absolute -top-24 right-[-60px] h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              direction === "forward"
                ? "radial-gradient(circle, #34D399, transparent)"
                : direction === "backward"
                  ? "radial-gradient(circle, #FB7185, transparent)"
                  : "radial-gradient(circle, #94A3B8, transparent)",
          }}
          aria-hidden="true"
        />

        {/* Card content */}
        <div className="relative flex h-full flex-col justify-between p-7">
          {/* Top section: Bulletin month */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-white/50 uppercase">
              <Calendar className="size-3" />
              {bulletinMonth} Bulletin
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                config.bgAccent,
                config.borderAccent,
                config.color,
                "border",
              )}
            >
              <span
                className={cn(
                  "inline-block size-1.5 animate-pulse rounded-full",
                  config.dotPulse,
                )}
              />
              {direction === "forward"
                ? "Advancing"
                : direction === "backward"
                  ? "Retrogressed"
                  : "No Change"}
            </span>
          </div>

          {/* Middle section: Main content */}
          <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
            {/* Emotive headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2
                className={cn(
                  "text-lg font-bold tracking-wide",
                  config.color,
                )}
              >
                {config.headline}
              </h2>
              <p className="mt-0.5 text-xs text-white/40">{config.subtext}</p>
            </motion.div>

            {/* Category + Country */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1"
            >
              <h3 className="text-4xl font-extrabold tracking-tight text-white">
                {category}
              </h3>
              <p className="flex items-center justify-center gap-1 text-sm font-medium text-white/60">
                <MapPin className="size-3" />
                {country}
              </p>
            </motion.div>

            {/* Priority Date */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.05] px-6 py-3 backdrop-blur-sm"
            >
              <p className="text-[10px] font-semibold tracking-widest text-white/40 uppercase">
                Priority Date
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {priorityDate}
              </p>
            </motion.div>

            {/* Movement indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2",
                config.bgAccent,
                config.borderAccent,
              )}
            >
              <DirectionIcon className={cn("size-5", config.color)} />
              <span className={cn("text-sm font-bold", config.color)}>
                {movement}
              </span>
            </motion.div>

            {/* Final Action Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-[10px] tracking-wider text-white/35 uppercase">
                Current Final Action Date
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white/70">
                {currentFinalAction}
              </p>
            </motion.div>
          </div>

          {/* Bottom: Watermark */}
          <div className="flex items-center justify-center">
            <span className="text-[11px] font-medium tracking-[0.2em] text-white/20 uppercase">
              VisaDateTracker
            </span>
          </div>
        </div>
      </motion.div>

      {/* Share button — outside the screenshot area for clean captures */}
      <ShareButton
        snapshotRef={cardRef}
        category={category}
        country={country}
        movement={movement}
        direction={direction}
        bulletinMonth={bulletinMonth}
      />
    </div>
  );
}
