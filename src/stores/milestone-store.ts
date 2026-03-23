import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MilestoneState {
  /** Keys follow the pattern "milestoneId-itemIndex" */
  checkedItems: Record<string, boolean>;
  toggleItem: (key: string) => void;
  clearAll: () => void;
}

export const useMilestoneStore = create<MilestoneState>()(
  persist(
    (set) => ({
      checkedItems: {},

      toggleItem: (key) =>
        set((state) => ({
          checkedItems: {
            ...state.checkedItems,
            [key]: !state.checkedItems[key],
          },
        })),

      clearAll: () => set({ checkedItems: {} }),
    }),
    {
      name: "visadate-milestone-checklist",
    }
  )
);
