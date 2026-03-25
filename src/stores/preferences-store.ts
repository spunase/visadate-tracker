import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PreferredCountry = "India" | "China" | "Mexico" | "Philippines" | "All Other";
export type PreferredCategory = "EB1" | "EB2" | "EB3" | "F1" | "F2A" | "F2B" | "F3" | "F4";
export type CategoryGroup = "Employment" | "Family";
export type PreferredPath = "AOS" | "CP";

interface PreferencesState {
  /** Default country — India has the longest queues */
  defaultCountry: PreferredCountry;
  /** Default visa preference category */
  defaultCategory: PreferredCategory;
  /** Default processing path */
  defaultPath: PreferredPath;
  /** Whether onboarding has been completed (user has explicitly chosen) */
  hasOnboarded: boolean;

  setDefaultCountry: (country: PreferredCountry) => void;
  setDefaultCategory: (category: PreferredCategory) => void;
  setDefaultPath: (path: PreferredPath) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const DEFAULTS = {
  defaultCountry: "India" as PreferredCountry,
  defaultCategory: "EB2" as PreferredCategory,
  defaultPath: "AOS" as PreferredPath,
  hasOnboarded: false,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setDefaultCountry: (country) =>
        set({ defaultCountry: country }),

      setDefaultCategory: (category) =>
        set({ defaultCategory: category }),

      setDefaultPath: (path) =>
        set({ defaultPath: path }),

      completeOnboarding: () =>
        set({ hasOnboarded: true }),

      resetPreferences: () =>
        set({ ...DEFAULTS, hasOnboarded: false }),
    }),
    {
      name: "visadate-preferences",
    },
  ),
);

/** Countries ordered by queue length (India longest, then China) */
export const COUNTRIES_BY_QUEUE: PreferredCountry[] = [
  "India",
  "China",
  "Philippines",
  "Mexico",
  "All Other",
];

/** Flag emoji and accent color metadata for each country */
export const COUNTRY_META: Record<
  PreferredCountry,
  {
    flag: string;
    accentLight: string;
    accentDark: string;
    glowLight: string;
    glowDark: string;
  }
> = {
  India: {
    flag: "\u{1F1EE}\u{1F1F3}",
    accentLight: "hsl(25 85% 55%)",
    accentDark: "hsl(25 85% 65%)",
    glowLight: "hsl(25 85% 55% / 0.25)",
    glowDark: "hsl(25 85% 45% / 0.35)",
  },
  China: {
    flag: "\u{1F1E8}\u{1F1F3}",
    accentLight: "hsl(0 70% 50%)",
    accentDark: "hsl(0 70% 62%)",
    glowLight: "hsl(0 70% 50% / 0.25)",
    glowDark: "hsl(0 70% 42% / 0.35)",
  },
  Philippines: {
    flag: "\u{1F1F5}\u{1F1ED}",
    accentLight: "hsl(210 70% 50%)",
    accentDark: "hsl(210 70% 62%)",
    glowLight: "hsl(210 70% 50% / 0.25)",
    glowDark: "hsl(210 70% 42% / 0.35)",
  },
  Mexico: {
    flag: "\u{1F1F2}\u{1F1FD}",
    accentLight: "hsl(145 65% 38%)",
    accentDark: "hsl(145 65% 50%)",
    glowLight: "hsl(145 65% 38% / 0.25)",
    glowDark: "hsl(145 65% 32% / 0.35)",
  },
  "All Other": {
    flag: "",
    accentLight: "hsl(215 80% 55%)",
    accentDark: "hsl(215 80% 65%)",
    glowLight: "hsl(215 80% 55% / 0.25)",
    glowDark: "hsl(215 80% 45% / 0.35)",
  },
};

export const CATEGORIES: PreferredCategory[] = ["EB1", "EB2", "EB3"];
export const FAMILY_CATEGORIES: PreferredCategory[] = ["F1", "F2A", "F2B", "F3", "F4"];
export const ALL_CATEGORIES: PreferredCategory[] = ["EB1", "EB2", "EB3", "F1", "F2A", "F2B", "F3", "F4"];
export const CATEGORY_GROUPS: { label: CategoryGroup; categories: PreferredCategory[] }[] = [
  { label: "Employment", categories: ["EB1", "EB2", "EB3"] },
  { label: "Family", categories: ["F1", "F2A", "F2B", "F3", "F4"] },
];
export const PATHS: PreferredPath[] = ["AOS", "CP"];
