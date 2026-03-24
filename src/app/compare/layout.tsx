import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EB2 vs EB3 Comparison",
  description:
    "Compare EB2 and EB3 priority date cutoffs side by side. See which category is moving faster and estimated wait times.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
