import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immigration Glossary",
  description:
    "Definitions for common immigration terms: priority date, visa bulletin, PERM, I-140, I-485, adjustment of status, and more.",
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
