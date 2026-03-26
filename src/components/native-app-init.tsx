"use client";

import { useEffect } from "react";
import {
  isNativePlatform,
  platform,
  hideSplashScreen,
  setStatusBarStyle,
  registerAppListeners,
} from "@/lib/native-bridge";
import { useTheme } from "@/components/theme-provider";

/**
 * Initializes native platform features when running inside Capacitor.
 * Handles splash screen, status bar, app lifecycle, and back button.
 * Renders nothing - pure side-effect component.
 */
export function NativeAppInit() {
  const { theme } = useTheme();

  // Hide splash screen on mount
  useEffect(() => {
    if (!isNativePlatform) return;
    // Small delay to ensure the web view has rendered
    const timer = setTimeout(() => {
      hideSplashScreen();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Sync status bar style with theme
  useEffect(() => {
    if (!isNativePlatform) return;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setStatusBarStyle(isDark ? "Light" : "Dark");
  }, [theme]);

  // Register app lifecycle listeners
  useEffect(() => {
    if (!isNativePlatform) return;

    registerAppListeners({
      onResume: () => {
        // Re-sync status bar when app comes back to foreground
        const isDark = document.documentElement.classList.contains("dark");
        setStatusBarStyle(isDark ? "Light" : "Dark");
      },
      onBackButton: () => {
        // Handle Android back button - go back in history or exit
        if (window.history.length > 1) {
          window.history.back();
        }
      },
    });
  }, []);

  // Add platform class to body for platform-specific CSS
  useEffect(() => {
    if (!isNativePlatform) return;
    document.body.classList.add("native-app");
    document.body.classList.add(`platform-${platform}`);
    return () => {
      document.body.classList.remove("native-app");
      document.body.classList.remove(`platform-${platform}`);
    };
  }, []);

  return null;
}
