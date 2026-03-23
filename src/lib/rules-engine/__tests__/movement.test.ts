import { describe, it, expect } from "vitest";
import { evaluateMovement } from "../movement";

describe("evaluateMovement (Type B)", () => {
  it("detects forward movement when cutoff moved later", () => {
    const previous = new Date("2013-06-01");
    const current = new Date("2013-09-15");

    const result = evaluateMovement(current, previous);

    expect(result.direction).toBe("forward");
    expect(result.days).toBeGreaterThan(0);
    expect(result.isRetrogression).toBe(false);
    expect(result.isNoChange).toBe(false);
    expect(result.summary).toContain("forward");
  });

  it("detects backward movement (retrogression)", () => {
    const previous = new Date("2013-09-15");
    const current = new Date("2013-06-01");

    const result = evaluateMovement(current, previous);

    expect(result.direction).toBe("retrogressed");
    expect(result.days).toBeLessThan(0);
    expect(result.isRetrogression).toBe(true);
    expect(result.isNoChange).toBe(false);
    expect(result.summary).toContain("retrogression");
  });

  it("detects no change when dates are the same", () => {
    const date = new Date("2013-09-15");

    const result = evaluateMovement(date, date);

    expect(result.direction).toBe("no_change");
    expect(result.days).toBeNull();
    expect(result.isRetrogression).toBe(false);
    expect(result.isNoChange).toBe(true);
  });

  it("detects transition from date to C (became_current)", () => {
    const previous = new Date("2013-09-15");
    const current = "C" as const;

    const result = evaluateMovement(current, previous);

    expect(result.direction).toBe("became_current");
    expect(result.days).toBeNull();
    expect(result.isRetrogression).toBe(false);
    expect(result.summary).toContain("Current");
  });

  it("detects transition from C to date (became_date)", () => {
    const previous = "C" as const;
    const current = new Date("2013-09-15");

    const result = evaluateMovement(current, previous);

    expect(result.direction).toBe("became_date");
    expect(result.days).toBeNull();
    expect(result.isRetrogression).toBe(true); // going from C to a date is a retrogression
    expect(result.summary).toContain("retrogression");
  });

  it("detects no change when both are C", () => {
    const result = evaluateMovement("C", "C");

    expect(result.direction).toBe("no_change");
    expect(result.isNoChange).toBe(true);
  });

  it("detects no change when both are U", () => {
    const result = evaluateMovement("U", "U");

    expect(result.direction).toBe("no_change");
    expect(result.isNoChange).toBe(true);
  });

  it("detects transition from U to date (became_available)", () => {
    const result = evaluateMovement(new Date("2013-09-15"), "U");

    expect(result.direction).toBe("became_available");
    expect(result.isRetrogression).toBe(false);
  });

  it("detects transition from date to U (became_unavailable)", () => {
    const result = evaluateMovement("U", new Date("2013-09-15"));

    expect(result.direction).toBe("became_unavailable");
    expect(result.isRetrogression).toBe(true);
  });
});
