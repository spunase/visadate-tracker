"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

interface GlossaryTerm {
  term: string;
  definition: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Priority Date",
    definition:
      "The date that establishes your place in the visa queue. For employment-based cases, this is typically the date your PERM labor certification was filed, or the date your I-140 petition was filed if no PERM was required.",
  },
  {
    term: "Final Action Date",
    definition:
      "The date on which visa availability is determined for applicants who have completed all processing steps. If your priority date is before this date, a visa number is available for you.",
  },
  {
    term: "Filing Date (Dates for Filing)",
    definition:
      "An earlier cut-off date that indicates when you can submit your adjustment of status (I-485) application, even though a visa number may not yet be immediately available.",
  },
  {
    term: "EB1 / EB2 / EB3",
    definition:
      "Employment-based preference categories. EB1 is for priority workers (extraordinary ability, outstanding researchers, multinational managers). EB2 is for professionals with advanced degrees or exceptional ability. EB3 is for skilled workers, professionals, and other workers.",
  },
  {
    term: "Adjustment of Status (AOS)",
    definition:
      "The process of applying for permanent residence (green card) while physically present in the United States. Filed using Form I-485.",
  },
  {
    term: "Consular Processing (CP)",
    definition:
      "The process of obtaining an immigrant visa at a U.S. consulate or embassy abroad, rather than adjusting status within the United States.",
  },
  {
    term: "Retrogression",
    definition:
      "When visa bulletin dates move backward, meaning fewer visa numbers are available. This typically happens when demand exceeds the annual allocation for a particular category or country.",
  },
  {
    term: "PERM Labor Certification",
    definition:
      "A process by which the Department of Labor certifies that there are no qualified U.S. workers available for a position, allowing an employer to sponsor a foreign worker for permanent residence.",
  },
  {
    term: "I-140 (Immigrant Petition)",
    definition:
      "Form I-140, Immigrant Petition for Alien Workers. Filed by an employer (or self-petitioner for EB1A/NIW) to classify a foreign national under an employment-based preference category.",
  },
  {
    term: "I-485 (Adjustment of Status)",
    definition:
      "Application to Register Permanent Residence or Adjust Status. The final step in the green card process for applicants inside the United States.",
  },
  {
    term: "National Visa Center (NVC)",
    definition:
      "The processing center that handles immigrant visa petitions after USCIS approval and before consular interview scheduling for those pursuing consular processing.",
  },
  {
    term: "Country of Chargeability",
    definition:
      "The country to which an applicant is charged for visa quota purposes, generally the applicant's country of birth. This determines which visa bulletin column applies to your case.",
  },
  {
    term: "EAD (Employment Authorization Document)",
    definition:
      "A work permit issued to individuals who are authorized to work in the United States. I-485 pending applicants can apply for an EAD using Form I-765.",
  },
  {
    term: "Advance Parole (AP)",
    definition:
      "A travel document (Form I-131) that allows certain applicants with pending I-485s to travel internationally and return to the United States without abandoning their application.",
  },
  {
    term: "RFE (Request for Evidence)",
    definition:
      "A notice from USCIS requesting additional documentation or information to support a pending petition or application. Must be responded to within the stated deadline.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

export default function GlossaryPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (term: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Glossary" subtitle="Immigration terms explained" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2 px-4 pb-8"
      >
        {glossaryTerms.map((entry) => {
          const isOpen = expanded.has(entry.term);
          return (
            <motion.div key={entry.term} variants={item}>
              <Card className="rounded-[18px] border border-border/50 shadow-sm">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggle(entry.term)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {entry.term}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/30 px-4 pb-4 pt-3">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {entry.definition}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
