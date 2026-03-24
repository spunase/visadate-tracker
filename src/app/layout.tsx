import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "@/components/layout/providers";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VisaDateTracker — Track Your Green Card Priority Date",
  description:
    "Track EB1, EB2, EB3 visa bulletin priority dates, monitor movement trends, and stay informed with the latest USCIS updates.",
  keywords: [
    "visa bulletin",
    "priority date",
    "green card",
    "EB1",
    "EB2",
    "EB3",
    "USCIS",
    "immigration",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F7F8FA] text-foreground dark:bg-[#0B1020]">
        <Providers>
          {/* Skip to content link — visible on focus for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#2F6BFF] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2F6BFF] focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <header className="fixed top-0 right-0 z-50 p-3">
            <ThemeToggle />
          </header>
          <main id="main-content" className="flex-1 pb-20" tabIndex={-1}>{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
