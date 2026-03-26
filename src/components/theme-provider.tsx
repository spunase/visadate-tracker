"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ─── Types ─────────────────────────────────────────────────────

export type Theme = "light" | "dark" | "system";

export interface ThemeContextValue {
  /** The user's preference (may be "system") */
  theme: Theme;
  /** The resolved mode actually applied to the DOM */
  resolvedTheme: "light" | "dark";
  /** Update the preference */
  setTheme: (theme: Theme) => void;
}

// ─── Context ───────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "visadate-theme";

// ─── Provider ──────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Default theme when nothing is stored yet */
  defaultTheme?: Theme;
  /** localStorage key override */
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemPreference, setSystemPreference] = useState<"light" | "dark">(
    "light",
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // localStorage unavailable - keep default
    }
  }, [storageKey]);

  // Listen for system preference changes
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    // Set initial value
    handler(mql);

    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () =>
      mql.removeEventListener(
        "change",
        handler as (e: MediaQueryListEvent) => void,
      );
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? systemPreference : theme;

  // Apply class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // localStorage unavailable - preference won't persist
      }
    },
    [storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
