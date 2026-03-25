"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface ShimmerRevealProps {
  children: ReactNode;
  /** Delay in seconds before the reveal starts */
  delay?: number;
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────

export function ShimmerReveal({
  children,
  delay = 0,
  className,
}: ShimmerRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Content fades in slightly after shimmer starts */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Shimmer sweep overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 0.8,
          delay: delay + 0.05,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.12) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
