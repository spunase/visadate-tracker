"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";

function getNextReminderLabel(reminderDay: number): string {
  const now = new Date();
  let targetMonth = now.getMonth();
  let targetYear = now.getFullYear();

  if (now.getDate() >= reminderDay) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const monthName = new Date(targetYear, targetMonth, 1).toLocaleString("default", { month: "long" });
  return `${monthName} ${reminderDay}`;
}

export function NotificationBell() {
  const {
    enabled,
    reminderDay,
    enableNotifications,
    disableNotifications,
    setReminderDay,
    syncPermission,
  } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncPermission();
  }, [syncPermission]);

  const Icon = mounted && enabled ? BellRing : Bell;
  const dayOptions = Array.from({ length: 28 }, (_, i) => i + 1);

  const handleEnable = async () => {
    await enableNotifications();
  };

  const handleTest = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("VisaDateTracker", {
        body: "Reminders are working! You\u2019ll be notified around bulletin release day each month.",
        icon: "/favicon.ico",
        tag: "visa-bulletin-test",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF] focus-visible:ring-offset-2"
        aria-label="Notifications"
      >
        <Icon className="h-5 w-5" />
        {mounted && enabled && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#2F6BFF]" aria-hidden="true" />
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-[24px]">
        <SheetHeader>
          <SheetTitle>Bulletin Reminders</SheetTitle>
          <SheetDescription>
            Get notified when new visa bulletins are released each month.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
          {mounted && enabled ? (
            /* ── Enabled state: settings ── */
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-400/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Reminders Active</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Next check around {getNextReminderLabel(reminderDay)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="reminder-day-sheet" className="text-xs font-medium text-muted-foreground">
                  Remind on day of month
                </label>
                <select
                  id="reminder-day-sheet"
                  value={reminderDay}
                  onChange={(e) => setReminderDay(Number(e.target.value))}
                  className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/50"
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleTest}>
                  <Bell className="mr-1 h-3 w-3" />
                  Test
                </Button>
                <Button size="sm" variant="ghost" onClick={disableNotifications}>
                  <BellOff className="mr-1 h-3 w-3" />
                  Disable
                </Button>
              </div>
            </>
          ) : (
            /* ── Not enabled: prompt ── */
            <>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF]/10 dark:bg-[#5B8CFF]/10">
                  <Bell className="h-4 w-4 text-[#2F6BFF] dark:text-[#5B8CFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Never miss a bulletin
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    We&apos;ll remind you to check each month around bulletin release
                    day. No account needed - notifications stay on this device.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleEnable}>
                  Enable Reminders
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
