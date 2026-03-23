"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, TrendingUp, Flag, Newspaper, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/track", label: "Track", icon: Search },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/milestones", label: "Milestones", icon: Flag },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/glossary", label: "Glossary", icon: BookOpen },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-white/80 backdrop-blur-lg dark:bg-[#0B1020]/80 safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors duration-200"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -inset-1.5 rounded-xl bg-[#2F6BFF]/10"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`relative h-5 w-5 transition-colors duration-200 ${
                    isActive
                      ? "text-[#2F6BFF]"
                      : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span
                className={`transition-colors duration-200 ${
                  isActive
                    ? "font-semibold text-[#2F6BFF]"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
