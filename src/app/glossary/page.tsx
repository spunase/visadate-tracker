"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Search, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SourceBadge } from "@/components/ui/source-badge";
import { GLOSSARY_TERMS, getRelatedTerms } from "@/lib/content/glossary-data";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

/** Check if a source URL is from USCIS or DOS (State Department). */
function isOfficialGovSource(url: string): boolean {
  return (
    url.includes("uscis.gov") || url.includes("travel.state.gov")
  );
}

export default function GlossaryPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandTerm = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Scroll to the term card
    const el = document.getElementById(`glossary-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const filteredTerms = useMemo(() => {
    if (!search.trim()) return GLOSSARY_TERMS;
    const q = search.toLowerCase();
    return GLOSSARY_TERMS.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader title="Glossary" subtitle="Immigration terms explained" />

      {/* Search / filter input */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[18px] border border-border/50 bg-card py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {search && (
          <p className="mt-1.5 px-1 text-xs text-muted-foreground">
            {filteredTerms.length} term{filteredTerms.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        )}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2 px-4 pb-8"
      >
        {filteredTerms.map((entry) => {
          const isOpen = expanded.has(entry.id);
          const related = getRelatedTerms(entry.relatedTerms);
          const isOfficial = isOfficialGovSource(entry.officialSource);

          return (
            <motion.div
              key={entry.id}
              id={`glossary-${entry.id}`}
              variants={item}
            >
              <Card className="rounded-[18px] border border-border/50 shadow-sm">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggle(entry.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-foreground">
                        {entry.term}
                      </span>
                      {isOfficial && (
                        <SourceBadge source="official" className="shrink-0" />
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 ml-2"
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

                          {/* Related terms */}
                          {related.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                                Related terms
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {related.map((rel) => (
                                  <button
                                    key={rel.id}
                                    onClick={() => expandTerm(rel.id)}
                                    className="rounded-[999px] bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
                                  >
                                    {rel.term}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Official source link */}
                          {entry.officialSource && (
                            <div className="mt-3">
                              <a
                                href={entry.officialSource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-calm-blue hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Official source
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredTerms.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No terms match &ldquo;{search}&rdquo;
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
