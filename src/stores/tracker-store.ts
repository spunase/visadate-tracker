import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedTracker {
  id: string;
  category: "EB1" | "EB2" | "EB3";
  country: "India" | "China" | "Mexico" | "Philippines" | "All Other";
  priorityDate: string; // ISO date string
  path: "AOS" | "CP";
  label: string;
  createdAt: string; // ISO date string
}

interface TrackerState {
  savedTrackers: SavedTracker[];
  addTracker: (tracker: Omit<SavedTracker, "id" | "createdAt">) => void;
  removeTracker: (id: string) => void;
  updateTracker: (id: string, updates: Partial<Omit<SavedTracker, "id" | "createdAt">>) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      savedTrackers: [],

      addTracker: (tracker) =>
        set((state) => ({
          savedTrackers: [
            ...state.savedTrackers,
            {
              ...tracker,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeTracker: (id) =>
        set((state) => ({
          savedTrackers: state.savedTrackers.filter((t) => t.id !== id),
        })),

      updateTracker: (id, updates) =>
        set((state) => ({
          savedTrackers: state.savedTrackers.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
    }),
    {
      name: "visadate-tracker-storage",
    }
  )
);
