import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Text } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "@/components/layout/providers";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ThemeToggle as DesignThemeToggle } from "@/components/ui/theme-toggle";
import { SettingsLink } from "@/components/layout/settings-link";
import { ErrorBoundary } from "@/components/error-boundary";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Text({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VisaDateTracker - Green Card Priority Date Tracker",
    template: "%s | VisaDateTracker",
  },
  description:
    "Track your employment-based green card priority date. View visa bulletin movement, EB2/EB3 trends, milestone checklists, and immigration news. Privacy-first, no account required.",
  keywords: [
    "visa bulletin",
    "green card tracker",
    "priority date",
    "EB2",
    "EB3",
    "EB1",
    "employment based immigration",
    "USCIS",
    "H-1B",
  ],
  authors: [{ name: "VisaDateTracker" }],
  openGraph: {
    title: "VisaDateTracker - Green Card Priority Date Tracker",
    description:
      "Track visa bulletin movement, check your EB2/EB3 priority date status, and plan your immigration journey.",
    url: "https://visadate-tracker.netlify.app",
    siteName: "VisaDateTracker",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisaDateTracker",
    description: "Privacy-first green card priority date tracker",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1020" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {/* Skip to content link - visible on focus for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#2F6BFF] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <header className="fixed top-0 right-0 z-50 flex items-center gap-1 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <DesignThemeToggle />
            <SettingsLink />
            <ThemeToggle />
          </header>
          <ErrorBoundary>
            <main id="main-content" className="flex-1 pb-20 pt-[env(safe-area-inset-top)]" tabIndex={-1}>{children}</main>
          </ErrorBoundary>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
