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
          <div className="fixed top-0 right-0 z-50 p-3">
            <ThemeToggle />
          </div>
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
