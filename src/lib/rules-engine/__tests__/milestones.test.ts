import { describe, it, expect } from "vitest";
import { getMilestones, resolveBand } from "../milestones";

describe("resolveBand", () => {
  it("returns 'far' for 24+ months behind", () => {
    // ~800 days behind
    expect(resolveBand(-800, "final_action")).toBe("far");
  });

  it("returns 'approaching' for 12-24 months behind", () => {
    // ~450 days behind (~15 months)
    expect(resolveBand(-450, "final_action")).toBe("approaching");
  });

  it("returns 'near' for 6-12 months behind", () => {
    // ~270 days behind (~9 months)
    expect(resolveBand(-270, "final_action")).toBe("near");
  });

  it("returns 'very_near' for 0-6 months behind", () => {
    // ~90 days behind (~3 months)
    expect(resolveBand(-90, "final_action")).toBe("very_near");
  });

  it("returns 'final_current' for positive distance on final_action", () => {
    expect(resolveBand(30, "final_action")).toBe("final_current");
  });

  it("returns 'filing_current' for positive distance on dates_for_filing", () => {
    expect(resolveBand(30, "dates_for_filing")).toBe("filing_current");
  });

  it("returns 'final_current' for null distance on final_action (C cutoff)", () => {
    expect(resolveBand(null, "final_action")).toBe("final_current");
  });

  it("returns 'filing_current' for null distance on dates_for_filing (C cutoff)", () => {
    expect(resolveBand(null, "dates_for_filing")).toBe("filing_current");
  });
});

describe("getMilestones (Type C)", () => {
  it("returns appropriate cards for far away (24+ months)", () => {
    const cards = getMilestones(-800, "EB2", "AOS", "final_action");

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.band === "far")).toBe(true);
    expect(cards.some((c) => c.title.includes("Final Action"))).toBe(true);
    expect(cards.some((c) => c.title.includes("Patterns"))).toBe(true);
    cards.forEach((c) => {
      expect(c.disclaimer).toBeTruthy();
      expect(c.sourceRefs.length).toBeGreaterThan(0);
    });
  });

  it("returns different cards for very near (0-6 months)", () => {
    const cards = getMilestones(-90, "EB2", "AOS", "final_action");

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.band === "very_near")).toBe(true);
    expect(cards.some((c) => c.title.includes("Watch"))).toBe(true);
    expect(cards.some((c) => c.title.includes("Prepare"))).toBe(true);
  });

  it("returns filing-current cards when current on filing chart", () => {
    // Positive distance on dates_for_filing
    const cards = getMilestones(30, "EB3", "AOS", "dates_for_filing");

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.band === "filing_current")).toBe(true);
    expect(
      cards.some((c) => c.body.includes("does not guarantee approval") || c.body.includes("does not mean approval")),
    ).toBe(true);
  });

  it("returns final-current cards when current on final action chart", () => {
    const cards = getMilestones(30, "EB2", "AOS", "final_action");

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((c) => c.band === "final_current")).toBe(true);
    expect(cards.some((c) => c.title.includes("Current for Final Action"))).toBe(true);
    expect(cards.some((c) => c.title.includes("Filing Instructions"))).toBe(true);
  });

  it("each card has required fields", () => {
    const allBands = [
      getMilestones(-800, "EB2", "AOS", "final_action"),
      getMilestones(-450, "EB2", "AOS", "final_action"),
      getMilestones(-270, "EB2", "AOS", "final_action"),
      getMilestones(-90, "EB2", "AOS", "final_action"),
      getMilestones(30, "EB2", "AOS", "dates_for_filing"),
      getMilestones(30, "EB2", "AOS", "final_action"),
    ];

    for (const cards of allBands) {
      for (const card of cards) {
        expect(card.id).toBeTruthy();
        expect(card.title).toBeTruthy();
        expect(card.body).toBeTruthy();
        expect(card.sourceRefs.length).toBeGreaterThan(0);
        expect(card.band).toBeTruthy();
        expect(card.disclaimer).toBeTruthy();
      }
    }
  });
});
