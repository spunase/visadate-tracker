"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Megaphone, X } from "lucide-react";

interface CheckNextResponse {
  available: boolean;
  month: string;
  year: number;
  url: string;
}

/**
 * Banner that appears when the next month's visa bulletin has been
 * published on the Department of State website. Includes a direct
 * hyperlink to the official bulletin page.
 */
export function NextBulletinBanner() {
  const prefersReduced = useReducedMotion();
  const [data, setData] = useState<CheckNextResponse | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check sessionStorage so we don't re-dismiss across navigations
    const key = "next-bulletin-dismissed";
    if (sessionStorage.getItem(key)) {
      setDismissed(true);
      return;
    }

    fetch("/api/bulletin/check-next")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: CheckNextResponse | null) => {
        if (json?.available) setData(json);
      })
      .catch(() => {
        // Silently fail — this is a non-critical enhancement
      });
  }, []);

  if (dismissed || !data) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("next-bulletin-dismissed", "1");
  };

  return (
    <motion.div
      initial={prefersReduced ? undefined : { opacity: 0, y: -8 }}
      animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      role="alert"
      className="relative overflow-hidden rounded-[18px] border border-success-emerald/30 bg-gradient-to-r from-success-emerald/10 via-success-emerald/5 to-transparent p-4 shadow-sm dark:border-success-emerald/20 dark:from-success-emerald/15 dark:via-success-emerald/8"
    >
      {/* Subtle shimmer */}
      {!prefersReduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-success-emerald/6 to-transparent dark:via-success-emerald/10"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 2,
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-emerald/20 dark:bg-success-emerald/30">
          <Megaphone className="size-4 text-success-emerald" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {data.month} {data.year} Bulletin is out!
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The Department of State has published the next visa bulletin.
          </p>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-success-emerald/15 px-3 py-1.5 text-xs font-semibold text-success-emerald transition-colors hover:bg-success-emerald/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-emerald focus-visible:ring-offset-2 dark:bg-success-emerald/20 dark:hover:bg-success-emerald/30"
          >
            View Official Bulletin
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss bulletin notification"
          className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue focus-visible:ring-offset-2"
        >
          <X className="size-4" />
        </button>
      </div>
    </motion.div>
  );
}
