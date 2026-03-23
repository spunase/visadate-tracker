import { describe, it, expect } from "vitest";
import { evaluateEligibility } from "../eligibility";

describe("evaluateEligibility (Type A)", () => {
  it("returns 'current' when priority date is before the cutoff", () => {
    const priorityDate = new Date("2013-01-15");
    const cutoff = new Date("2013-09-15");

    const result = evaluateEligibility(priorityDate, cutoff, "final_action");

    expect(result.state).toBe("current");
    expect(result.distanceDays).toBeGreaterThan(0);
    expect(result.explanation).toContain("current");
  });

  it("returns 'not_current' with correct distance when priority date is after cutoff", () => {
    const priorityDate = new Date("2014-02-10");
    const cutoff = new Date("2013-09-15");

    const result = evaluateEligibility(priorityDate, cutoff, "final_action");

    expect(result.state).toBe("not_current");
    expect(result.distanceDays).toBeLessThan(0);
    // The distance should be roughly -148 days (Sept 15 to Feb 10)
    expect(result.distanceDays).toBe(-148);
    expect(result.explanation).toContain("not yet current");
    expect(result.explanation).toContain("148");
  });

  it("returns 'current' when cutoff is 'C' regardless of priority date", () => {
    const priorityDate = new Date("2025-12-31"); // far future date
    const cutoff = "C" as const;

    const result = evaluateEligibility(priorityDate, cutoff, "final_action");

    expect(result.state).toBe("current");
    expect(result.distanceDays).toBeNull();
    expect(result.explanation).toContain("Current");
  });

  it("returns 'unavailable' when cutoff is 'U'", () => {
    const priorityDate = new Date("2020-01-01");
    const cutoff = "U" as const;

    const result = evaluateEligibility(priorityDate, cutoff, "final_action");

    expect(result.state).toBe("unavailable");
    expect(result.distanceDays).toBeNull();
    expect(result.explanation).toContain("Unavailable");
  });

  it("returns 'current' when priority date equals the cutoff (edge case)", () => {
    const date = new Date("2013-09-15");

    const result = evaluateEligibility(date, date, "final_action");

    expect(result.state).toBe("current");
    expect(result.distanceDays).toBe(0);
    expect(result.explanation).toContain("exactly on");
  });

  it("returns 'filing_current' for dates_for_filing chart when user is current", () => {
    const priorityDate = new Date("2013-01-15");
    const cutoff = new Date("2013-09-15");

    const result = evaluateEligibility(priorityDate, cutoff, "dates_for_filing");

    expect(result.state).toBe("filing_current");
    expect(result.distanceDays).toBeGreaterThan(0);
    expect(result.explanation).toContain("filing chart");
  });

  it("returns 'not_current' for dates_for_filing chart when user is behind", () => {
    const priorityDate = new Date("2014-06-01");
    const cutoff = new Date("2014-01-01");

    const result = evaluateEligibility(priorityDate, cutoff, "dates_for_filing");

    expect(result.state).toBe("not_current");
    expect(result.distanceDays).toBeLessThan(0);
  });
});
