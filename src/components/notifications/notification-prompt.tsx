"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";

const DISMISS_KEY = "visadate-notification-prompt-dismissed";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  return Date.now() - dismissedAt < DISMISS_DURATION_MS;
}

export function NotificationPrompt() {
  const { enabled, enableNotifications } = useNotificationStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if: browser supports notifications, user hasn't opted in, and not recently dismissed
    const supported =
      typeof window !== "undefined" && "Notification" in window;
    if (supported && !enabled && !isDismissed()) {
      setVisible(true);
    }
  }, [enabled]);

  if (!visible) return null;

  const handleEnable = async () => {
    await enableNotifications();
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <Card className="relative rounded-[18px] border border-[#2F6BFF]/20 bg-[#2F6BFF]/[0.04] shadow-sm dark:border-[#5B8CFF]/20 dark:bg-[#5B8CFF]/[0.04]">
      <CardContent className="p-4">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF]/10 dark:bg-[#5B8CFF]/10">
            <Bell className="h-4 w-4 text-[#2F6BFF] dark:text-[#5B8CFF]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Get notified when new bulletins drop
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              We&apos;ll remind you to check each month around bulletin release
              day. No account needed — notifications stay on this device.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" onClick={handleEnable}>
                Enable Reminders
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
