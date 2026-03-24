import { useNotificationStore } from "@/stores/notification-store";

/**
 * Checks whether it's time to remind the user about a new Visa Bulletin
 * and fires a browser notification if conditions are met.
 *
 * Conditions:
 * 1. Notifications are enabled and permission is granted
 * 2. Today is on or after the reminderDay of the current month
 * 3. The user hasn't already been notified this month
 */
export function checkAndNotify(): void {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  const state = useNotificationStore.getState();

  if (!state.enabled || state.permission !== "granted") {
    return;
  }

  const now = new Date();
  const currentDay = now.getDate();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (currentDay < state.reminderDay) {
    return;
  }

  if (state.lastNotifiedMonth === yearMonth) {
    return;
  }

  // Fire the notification
  new Notification("Visa Bulletin Reminder", {
    body: "New Visa Bulletin may be available — Check the latest priority dates for your category.",
    icon: "/favicon.ico",
    tag: `visa-bulletin-${yearMonth}`,
  });

  state.markNotified(yearMonth);
}
