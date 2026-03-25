import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "quiet-clarity" | "risograph";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "quiet-clarity",
      setTheme: (theme) => set({ theme }),
      cycleTheme: () =>
        set((state) => ({
          theme: state.theme === "quiet-clarity" ? "risograph" : "quiet-clarity",
        })),
    }),
    { name: "visadate-design-theme" }
  )
);
