"use client";

import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";

function getNextReminderLabel(reminderDay: number): string {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let targetMonth = currentMonth;
  let targetYear = currentYear;

  // If we've already passed the reminder day this month, move to next month
  if (currentDay >= reminderDay) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const monthName = new Date(targetYear, targetMonth, 1).toLocaleString(
    "default",
    { month: "long" }
  );

  return `${monthName} ${reminderDay}`;
}

export function NotificationSettings() {
  const {
    enabled,
    reminderDay,
    enableNotifications,
    disableNotifications,
    setReminderDay,
  } = useNotificationStore();

  if (!enabled) return null;

  const handleToggle = async () => {
    if (enabled) {
      disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleTest = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("VisaDateTracker Test", {
        body: "Reminders are working! You'll be notified around bulletin release day each month.",
        icon: "/favicon.ico",
        tag: "visa-bulletin-test",
      });
    }
  };

  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <Card className="rounded-[18px] border border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-400/10">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Bulletin Reminders
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Reminders active - next check around{" "}
              {getNextReminderLabel(reminderDay)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {/* Day picker */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="reminder-day"
              className="text-xs font-medium text-muted-foreground"
            >
              Remind on day of month
            </label>
            <select
              id="reminder-day"
              value={reminderDay}
              onChange={(e) => setReminderDay(Number(e.target.value))}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50"
            >
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleTest}>
              <Bell className="mr-1 h-3 w-3" />
              Test Notification
            </Button>
            <Button size="sm" variant="ghost" onClick={handleToggle}>
              <BellOff className="mr-1 h-3 w-3" />
              Disable
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
