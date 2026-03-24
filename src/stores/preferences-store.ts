import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PreferredCountry = "India" | "China" | "Mexico" | "Philippines" | "All Other";
export type PreferredCategory = "EB1" | "EB2" | "EB3";
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

export const CATEGORIES: PreferredCategory[] = ["EB1", "EB2", "EB3"];
export const PATHS: PreferredPath[] = ["AOS", "CP"];
