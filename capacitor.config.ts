import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.visadatetracker.app",
  appName: "VisaDateTracker",
  webDir: "out",
  // For development, point to local dev server:
  // server: { url: "http://localhost:3000", cleartext: true },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F7F8FA",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#F7F8FA",
    },
    Keyboard: {
      resize: "body" as unknown as import("@capacitor/keyboard").KeyboardResize,
      style: "DARK" as unknown as import("@capacitor/keyboard").KeyboardStyle,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "VisaDateTracker",
    backgroundColor: "#F7F8FA",
  },
  android: {
    backgroundColor: "#F7F8FA",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
