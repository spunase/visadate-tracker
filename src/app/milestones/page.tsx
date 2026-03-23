"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StatusBand = "far" | "approaching" | "current" | "filed";

const statusBands: { key: StatusBand; label: string; color: string }[] = [
  { key: "far", label: "Far from Current", color: "bg-slate-400" },
  { key: "approaching", label: "Approaching", color: "bg-amber-400" },
  { key: "current", label: "Current", color: "bg-emerald-400" },
  { key: "filed", label: "Filed / Pending", color: "bg-[#2F6BFF]" },
];

interface MilestoneItem {
  id: string;
  text: string;
}

interface MilestoneCard {
  id: string;
  title: string;
  body: string;
  source: string;
  band: StatusBand;
  items: MilestoneItem[];
}

const milestoneCards: MilestoneCard[] = [
  {
    id: "1",
    title: "Gather Key Documents",
    body: "Begin collecting civil documents, educational credentials, and employment verification letters.",
    source: "General Guidance",
    band: "far",
    items: [
      { id: "1a", text: "Birth certificate with English translation" },
      { id: "1b", text: "Passport valid for 6+ months" },
      { id: "1c", text: "Educational transcripts and evaluations" },
      { id: "1d", text: "Employment verification letters" },
    ],
  },
  {
    id: "2",
    title: "Medical Examination",
    body: "Schedule your I-693 civil surgeon exam. Results are valid for 2 years from signature date.",
    source: "USCIS I-693",
    band: "approaching",
    items: [
      { id: "2a", text: "Find USCIS-designated civil surgeon" },
      { id: "2b", text: "Schedule appointment (allow 2-4 weeks)" },
      { id: "2c", text: "Bring vaccination records" },
      { id: "2d", text: "Receive sealed I-693 form" },
    ],
  },
  {
    id: "3",
    title: "Prepare AOS Filing Package",
    body: "Assemble your I-485, I-765 (EAD), and I-131 (AP) applications with supporting evidence.",
    source: "USCIS I-485",
    band: "current",
    items: [
      { id: "3a", text: "Complete Form I-485" },
      { id: "3b", text: "Complete Form I-765 (work permit)" },
      { id: "3c", text: "Complete Form I-131 (travel document)" },
      { id: "3d", text: "Prepare filing fees or fee waiver" },
      { id: "3e", text: "Compile two passport-style photos" },
    ],
  },
  {
    id: "4",
    title: "Post-Filing: Track Your Case",
    body: "After filing, monitor receipt notices, biometrics appointment, and RFE responses.",
    source: "USCIS Case Status",
    band: "filed",
    items: [
      { id: "4a", text: "Receive I-797C receipt notices" },
      { id: "4b", text: "Attend biometrics appointment" },
      { id: "4c", text: "Respond to any RFEs within deadline" },
      { id: "4d", text: "Monitor case status online" },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function MilestonesPage() {
  const [activeBand, setActiveBand] = useState<StatusBand | "all">("all");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered =
    activeBand === "all"
      ? milestoneCards
      : milestoneCards.filter((c) => c.band === activeBand);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Milestones" subtitle="Preparation checklist by status" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-4 pb-8"
      >
        {/* Status Band Indicator */}
        <motion.div variants={item}>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveBand("all")}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeBand === "all"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {statusBands.map((band) => (
              <button
                key={band.key}
                onClick={() => setActiveBand(band.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeBand === band.key
                    ? "bg-foreground text-background shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${band.color}`} />
                {band.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Milestone Cards */}
        {filtered.map((card) => {
          const bandInfo = statusBands.find((b) => b.key === card.band);
          return (
            <motion.div key={card.id} variants={item}>
              <Card className="rounded-[18px] border border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${bandInfo?.color}`} />
                    <CardTitle className="text-base font-semibold">
                      {card.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-muted-foreground">{card.body}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    {card.source}
                  </Badge>

                  <div className="mt-3 flex flex-col gap-2">
                    {card.items.map((ci) => {
                      const isChecked = checkedItems.has(ci.id);
                      return (
                        <button
                          key={ci.id}
                          onClick={() => toggleItem(ci.id)}
                          className="flex items-start gap-2.5 rounded-lg p-1 text-left transition-colors hover:bg-muted/50"
                        >
                          {isChecked ? (
                            <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6BFF]" />
                          ) : (
                            <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span
                            className={`text-sm ${
                              isChecked
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {ci.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Disclaimer */}
        <motion.div variants={item}>
          <div className="flex items-start gap-2 rounded-xl bg-muted/60 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              These are preparation suggestions, not legal advice. Immigration
              processes vary by individual case. Always consult a qualified
              immigration attorney before taking action.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
