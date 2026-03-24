import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priority Date Trends & History",
  description:
    "View historical priority date movement charts for EB1, EB2, and EB3 categories. Analyze trends and predict future visa bulletin movement.",
};

export default function TrendsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
