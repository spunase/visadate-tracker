"use client";

import { useEffect, useState, useId } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

export interface ConfettiBurstProps {
  /** When toggled to true, fires one burst */
  trigger: boolean;
  /** Visual style - confetti uses rectangular pieces, sparkle uses star shapes */
  variant?: "confetti" | "sparkle";
  /** Override the default particle colors */
  colors?: string[];
  className?: string;
}

// ─── Defaults ──────────────────────────────────────────────────

const DEFAULT_COLORS = ["#4AADA3", "#CF7B73", "#DEAD45"]; // teal, coral, gold - risograph inks
const PARTICLE_COUNT = 20;
const ANIMATION_DURATION_MS = 1500;

// ─── Keyframes ─────────────────────────────────────────────────

const keyframesCSS = `
@keyframes confetti-burst {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--cb-tx), var(--cb-ty)) rotate(var(--cb-rot)) scale(0);
    opacity: 0;
  }
}

@keyframes sparkle-burst {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  30% {
    transform: translate(calc(var(--cb-tx) * 0.3), calc(var(--cb-ty) * 0.3)) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(var(--cb-tx), var(--cb-ty)) scale(0);
    opacity: 0;
  }
}

@keyframes confetti-glow {
  0% { opacity: 0; }
  30% { opacity: 0.6; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-particle {
    animation: none !important;
  }
  .confetti-glow-fallback {
    animation: confetti-glow 1.5s ease-out forwards !important;
  }
}
`;

// ─── Helpers ───────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface Particle {
  key: number;
  color: string;
  tx: number;
  ty: number;
  rotation: number;
  delay: number;
  size: number;
}

function generateParticles(colors: string[]): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + randomBetween(-0.3, 0.3);
    const distance = randomBetween(40, 100);
    return {
      key: i,
      color: colors[i % colors.length],
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      rotation: randomBetween(180, 720),
      delay: randomBetween(0, 0.15),
      size: randomBetween(4, 8),
    };
  });
}

// ─── Component ─────────────────────────────────────────────────

export function ConfettiBurst({
  trigger,
  variant = "confetti",
  colors = DEFAULT_COLORS,
  className,
}: ConfettiBurstProps) {
  const [particles, setParticles] = useState<Particle[] | null>(null);
  const styleId = useId();

  useEffect(() => {
    if (!trigger) return;

    setParticles(generateParticles(colors)); // eslint-disable-line react-hooks/set-state-in-effect

    const timer = setTimeout(() => {
      setParticles(null);  
    }, ANIMATION_DURATION_MS + 200);

    return () => clearTimeout(timer);
  }, [trigger, colors]);

  if (!particles) return null;

  const animationName = variant === "sparkle" ? "sparkle-burst" : "confetti-burst";

  return (
    <span
      className={cn("pointer-events-none absolute inset-0 z-50 overflow-visible", className)}
      aria-hidden="true"
    >
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />

      {/* Reduced-motion glow fallback */}
      <span
        className="confetti-glow-fallback absolute left-1/2 top-1/2 hidden size-16 -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:block"
        style={{
          background: `radial-gradient(circle, ${colors[0]}40 0%, transparent 70%)`,
          animation: `confetti-glow ${ANIMATION_DURATION_MS}ms ease-out forwards`,
        }}
      />

      {/* Particles */}
      <span className="absolute left-1/2 top-1/2 motion-reduce:hidden">
        {particles.map((p) => (
          <span
            key={`${styleId}-${p.key}`}
            className="confetti-particle absolute"
            style={{
              "--cb-tx": `${p.tx}px`,
              "--cb-ty": `${p.ty}px`,
              "--cb-rot": `${p.rotation}deg`,
              width: variant === "sparkle" ? p.size * 1.2 : p.size,
              height: variant === "sparkle" ? p.size * 1.2 : p.size * 0.5,
              backgroundColor: variant === "confetti" ? p.color : "transparent",
              borderRadius: variant === "sparkle" ? "50%" : "1px",
              boxShadow: variant === "sparkle" ? `0 0 ${p.size}px ${p.color}, 0 0 ${p.size * 2}px ${p.color}40` : "none",
              animation: `${animationName} ${ANIMATION_DURATION_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
            } as React.CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}
