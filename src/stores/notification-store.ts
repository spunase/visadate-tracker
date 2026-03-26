import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationState {
  /** Whether the user has opted in to reminders */
  enabled: boolean;
  /** Browser Notification permission state */
  permission: NotificationPermission;
  /** Day of month to send reminder (1-28) */
  reminderDay: number;
  /** e.g. "2026-03" - prevents duplicate notifications in the same month */
  lastNotifiedMonth: string | null;

  enableNotifications: () => Promise<void>;
  disableNotifications: () => void;
  setReminderDay: (day: number) => void;
  markNotified: (yearMonth: string) => void;
  syncPermission: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      enabled: false,
      permission: "default" as NotificationPermission,
      reminderDay: 10,
      lastNotifiedMonth: null,

      enableNotifications: async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
          return;
        }
        const result = await Notification.requestPermission();
        set({
          permission: result,
          enabled: result === "granted",
        });
      },

      disableNotifications: () => {
        set({ enabled: false });
      },

      setReminderDay: (day: number) => {
        const clamped = Math.max(1, Math.min(28, day));
        set({ reminderDay: clamped });
      },

      markNotified: (yearMonth: string) => {
        set({ lastNotifiedMonth: yearMonth });
      },

      syncPermission: () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
          return;
        }
        const current = Notification.permission;
        set((state) => ({
          permission: current,
          // If permission was revoked externally, disable
          enabled: current !== "granted" ? false : state.enabled,
        }));
      },
    }),
    {
      name: "visadate-notifications",
    }
  )
);
