"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";
import { useTrackerStore } from "@/stores/tracker-store";
import { NativeAppInit } from "@/components/native-app-init";

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const syncForUser = useTrackerStore((s) => s.syncForUser);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  useEffect(() => {
    const unsubscribe = syncForUser(uid);
    return unsubscribe;
  }, [syncForUser, uid]);

  return (
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <NativeAppInit />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
