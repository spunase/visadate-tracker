import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immigration Milestones Checklist",
  description:
    "Track your green card journey milestones from PERM to I-485 approval. Interactive checklist for employment-based immigration steps.",
};

export default function MilestonesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
