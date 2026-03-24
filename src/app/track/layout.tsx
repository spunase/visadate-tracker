import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Your Priority Date Status",
  description:
    "Enter your priority date and category to see where you stand in the visa bulletin queue. Instant EB1, EB2, EB3 status check.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
