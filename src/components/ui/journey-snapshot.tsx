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
import { useThemeStore } from "@/stores/theme-store";

// ─── Types ─────────────────────────────────────────────────────

export interface JourneySnapshotProps {
  category: string;
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

const risoCategoryGradients: Record<string, string> = {
  EB1: "from-[#4AADA3]/20 via-[#F4EDE1] to-[#F4EDE1]",
  EB2: "from-[#CF7B73]/20 via-[#F4EDE1] to-[#F4EDE1]",
  EB3: "from-[#DEAD45]/20 via-[#F4EDE1] to-[#F4EDE1]",
};

const risoDirectionConfig = {
  forward: {
    headline: "Moving Forward!",
    subtext: "Progress This Month",
    color: "text-[#2D7A72]",
    glowColor: "",
    bgAccent: "bg-[#4AADA3]/15",
    borderAccent: "border-[#4AADA3]/40",
    icon: TrendingUp,
    dotPulse: "bg-[#4AADA3]",
  },
  backward: {
    headline: "Retrogression Alert",
    subtext: "Dates Moved Back",
    color: "text-[#C43C3C]",
    glowColor: "",
    bgAccent: "bg-[#C43C3C]/15",
    borderAccent: "border-[#C43C3C]/40",
    icon: TrendingDown,
    dotPulse: "bg-[#C43C3C]",
  },
  none: {
    headline: "Holding Steady",
    subtext: "No Movement This Month",
    color: "text-[#8A847E]",
    glowColor: "",
    bgAccent: "bg-[#D1CABD]/30",
    borderAccent: "border-[#D1CABD]/50",
    icon: Minus,
    dotPulse: "bg-[#B8B2A8]",
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
  isRiso: boolean;
  btnBg: string;
}

function ShareButton({
  snapshotRef,
  category,
  country,
  movement,
  direction,
  bulletinMonth,
  isRiso,
  btnBg,
}: ShareButtonProps) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">(
    "idle",
  );

  const headlineConfig = isRiso ? risoDirectionConfig[direction] : directionConfig[direction];
  const shareText = `${headlineConfig.headline} ${category} ${country}: ${movement} (${bulletinMonth} Visa Bulletin) - tracked on VisaDateTracker`;

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
        btnBg,
        "font-semibold backdrop-blur-sm",
        "border transition-colors",
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
            className={cn("flex items-center gap-2", isRiso ? "text-[#4AADA3]" : "text-[#34D399]")}
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
            className={cn("flex items-center gap-2", isRiso ? "text-[#4AADA3]" : "text-[#34D399]")}
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
  const isRiso = useThemeStore((s) => s.theme) === "risograph";
  const config = isRiso ? risoDirectionConfig[direction] : directionConfig[direction];
  const gradients = isRiso ? risoCategoryGradients : categoryGradients;
  const DirectionIcon = config.icon;

  const textPrimary = isRiso ? "text-[#2D2B2A]" : "text-white";
  const textSecondary = isRiso ? "text-[#8A847E]" : "text-white/50";
  const textTertiary = isRiso ? "text-[#B8B2A8]" : "text-white/40";
  const textMuted = isRiso ? "text-[#6B6560]" : "text-white/60";
  const textSubtle = isRiso ? "text-[#8A847E]" : "text-white/70";
  const bgOverlay = isRiso ? "bg-[#D1CABD]/20 border-[#D1CABD]/30" : "bg-white/[0.05] border-white/[0.06]";
  const btnBg = isRiso ? "bg-[#2D2B2A]/10 border-[#D1CABD]/30 text-[#2D2B2A]" : "bg-white/10 border-white/10 text-white";
  const watermarkColor = isRiso ? "text-[#D1CABD]" : "text-white/20";

  return (
    <div className="flex flex-col items-center">
      {/* Snapshot card — 4:5 aspect ratio (optimal for Instagram/social) */}
      <motion.div
        ref={cardRef}
        className={cn(
          "relative w-[360px] overflow-hidden rounded-2xl",
          "bg-gradient-to-br",
          gradients[category] ?? gradients.EB2,
          isRiso ? "border-2 border-[#D1CABD]" : "border border-white/[0.08]",
          config.glowColor,
        )}
        style={{ aspectRatio: "4 / 5" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Background texture */}
        {!isRiso && <GridPattern />}

        {/* Radial glow accent */}
        <div
          className={cn("pointer-events-none absolute -top-24 right-[-60px] h-64 w-64 rounded-full opacity-20 blur-3xl", isRiso && "hidden")}
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
            <span className={cn("flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase", textSecondary)}>
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
              <p className={cn("mt-0.5 text-xs", textTertiary)}>{config.subtext}</p>
            </motion.div>

            {/* Category + Country */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1"
            >
              <h3 className={cn("text-4xl font-extrabold tracking-tight", textPrimary)}>
                {category}
              </h3>
              <p className={cn("flex items-center justify-center gap-1 text-sm font-medium", textMuted)}>
                <MapPin className="size-3" />
                {country}
              </p>
            </motion.div>

            {/* Priority Date */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn("rounded-xl border px-6 py-3 backdrop-blur-sm", bgOverlay)}
            >
              <p className={cn("text-[10px] font-semibold tracking-widest uppercase", textTertiary)}>
                Priority Date
              </p>
              <p className={cn("mt-1 text-2xl font-bold tabular-nums", textPrimary)}>
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
              <p className={cn("text-[10px] tracking-wider uppercase", textTertiary)}>
                Current Final Action Date
              </p>
              <p className={cn("mt-0.5 text-sm font-semibold", textSubtle)}>
                {currentFinalAction}
              </p>
            </motion.div>
          </div>

          {/* Bottom: Watermark */}
          <div className="flex items-center justify-center">
            <span className={cn("text-[11px] font-medium tracking-[0.2em] uppercase", watermarkColor)}>
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
        isRiso={isRiso}
        btnBg={btnBg}
      />
    </div>
  );
}
