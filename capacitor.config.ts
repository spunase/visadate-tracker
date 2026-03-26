import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.visadatetracker.app",
  appName: "VisaDateTracker",
  webDir: "out",
  server: {
    // Production: load from deployed Netlify site
    url: "https://visadate-tracker.netlify.app",
    // Allow navigation within the app domain
    allowNavigation: ["visadate-tracker.netlify.app", "*.supabase.co"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#F7F8FA",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      useDialog: true,
    },
    StatusBar: {
      style: "LIGHT" as unknown as import("@capacitor/status-bar").Style,
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
