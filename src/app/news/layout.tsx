import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immigration News & Policy Updates",
  description:
    "Stay informed with the latest USCIS policy changes, visa bulletin updates, and employment-based immigration news.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
