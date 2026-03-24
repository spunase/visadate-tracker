"use client";

import { useEffect } from "react";
import { Paintbrush } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, cycleTheme } = useThemeStore();

  // Sync theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-quiet-clarity", "theme-risograph");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent",
        theme === "risograph" && "text-[#E8B84B] hover:bg-[#E8B84B]/10",
        className,
      )}
      aria-label={`Current theme: ${theme === "quiet-clarity" ? "Quiet Clarity" : "Risograph"}. Click to switch.`}
      title={theme === "quiet-clarity" ? "Switch to Risograph theme" : "Switch to Quiet Clarity theme"}
    >
      <Paintbrush className="h-5 w-5" />
    </button>
  );
}
