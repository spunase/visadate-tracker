/**
 * Native Bridge - Safe Capacitor API access layer
 *
 * Provides a unified interface to native device APIs via Capacitor.
 * Gracefully falls back to web APIs when running in a browser.
 */

import { Capacitor } from "@capacitor/core";

/** Whether the app is running inside a native mobile shell */
export const isNativePlatform = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// ---------- Status Bar ----------
export async function setStatusBarStyle(style: "Light" | "Dark") {
  if (!isNativePlatform) return;
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  await StatusBar.setStyle({ style: style === "Dark" ? Style.Dark : Style.Light });
}

export async function hideStatusBar() {
  if (!isNativePlatform) return;
  const { StatusBar } = await import("@capacitor/status-bar");
  await StatusBar.hide();
}

// ---------- Haptics ----------
export async function hapticImpact(style: "Heavy" | "Medium" | "Light" = "Medium") {
  if (!isNativePlatform) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  await Haptics.impact({ style: ImpactStyle[style] });
}

export async function hapticNotification(type: "Success" | "Warning" | "Error" = "Success") {
  if (!isNativePlatform) return;
  const { Haptics, NotificationType } = await import("@capacitor/haptics");
  await Haptics.notification({ type: NotificationType[type] });
}

// ---------- Keyboard ----------
export async function hideKeyboard() {
  if (!isNativePlatform) return;
  const { Keyboard } = await import("@capacitor/keyboard");
  await Keyboard.hide();
}

// ---------- Share ----------
export async function nativeShare(options: { title: string; text: string; url?: string }) {
  if (!isNativePlatform) {
    // Fallback to Web Share API
    if (navigator.share) {
      await navigator.share(options);
    }
    return;
  }
  const { Share } = await import("@capacitor/share");
  await Share.share(options);
}

// ---------- Browser ----------
export async function openInBrowser(url: string) {
  if (!isNativePlatform) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
}

// ---------- Splash Screen ----------
export async function hideSplashScreen() {
  if (!isNativePlatform) return;
  const { SplashScreen } = await import("@capacitor/splash-screen");
  await SplashScreen.hide();
}

// ---------- Push Notifications ----------
export async function registerPushNotifications() {
  if (!isNativePlatform) return null;
  const { PushNotifications } = await import("@capacitor/push-notifications");

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== "granted") return null;

  await PushNotifications.register();

  return new Promise<string>((resolve) => {
    PushNotifications.addListener("registration", (token) => {
      resolve(token.value);
    });
  });
}

// ---------- Preferences (Key-Value Storage) ----------
export async function setPreference(key: string, value: string) {
  if (!isNativePlatform) {
    localStorage.setItem(key, value);
    return;
  }
  const { Preferences } = await import("@capacitor/preferences");
  await Preferences.set({ key, value });
}

export async function getPreference(key: string): Promise<string | null> {
  if (!isNativePlatform) {
    return localStorage.getItem(key);
  }
  const { Preferences } = await import("@capacitor/preferences");
  const result = await Preferences.get({ key });
  return result.value;
}

// ---------- App Lifecycle ----------
export async function registerAppListeners(callbacks: {
  onResume?: () => void;
  onPause?: () => void;
  onBackButton?: () => void;
}) {
  if (!isNativePlatform) return;
  const { App } = await import("@capacitor/app");

  if (callbacks.onResume) {
    App.addListener("resume", callbacks.onResume);
  }
  if (callbacks.onPause) {
    App.addListener("pause", callbacks.onPause);
  }
  if (callbacks.onBackButton) {
    App.addListener("backButton", callbacks.onBackButton);
  }
}
