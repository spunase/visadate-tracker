import { describe, expect, it } from "vitest";
import { calculateMovement } from "../movement-calculator";
import type { ParsedCutoffRow } from "../types";

/** Helper to create a minimal ParsedCutoffRow for testing */
function makeRow(
  overrides: Partial<ParsedCutoffRow> & Pick<ParsedCutoffRow, "cutoff_kind">
): ParsedCutoffRow {
  return {
    bulletin_month: "2026-03",
    chart_type: "final_action",
    category: "EB2",
    country_bucket: "india",
    cutoff_date: null,
    original_value: "",
    ...overrides,
  };
}

describe("calculateMovement", () => {
  describe("date-to-date comparisons", () => {
    it("calculates forward movement (73 days)", () => {
      const current = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-03-15",
      });
      const previous = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-01-01",
      });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBe(73);
      expect(result.movement_direction).toBe("forward");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(false);
    });

    it("calculates backward movement (retrogression)", () => {
      const current = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-01-01",
      });
      const previous = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-03-15",
      });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBe(-73);
      expect(result.movement_direction).toBe("backward");
      expect(result.is_retrogression).toBe(true);
      expect(result.is_no_change).toBe(false);
    });

    it("calculates no change (same date)", () => {
      const current = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const previous = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBe(0);
      expect(result.movement_direction).toBe("unchanged");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(true);
    });
  });

  describe("date-to-current transitions", () => {
    it("date → current is forward movement", () => {
      const current = makeRow({ cutoff_kind: "current" });
      const previous = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("forward");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(false);
    });

    it("current → date is retrogression", () => {
      const current = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const previous = makeRow({ cutoff_kind: "current" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("backward");
      expect(result.is_retrogression).toBe(true);
      expect(result.is_no_change).toBe(false);
    });
  });

  describe("current-to-current", () => {
    it("current → current is no change", () => {
      const current = makeRow({ cutoff_kind: "current" });
      const previous = makeRow({ cutoff_kind: "current" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("unchanged");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(true);
    });
  });

  describe("unavailable transitions", () => {
    it("unavailable → unavailable is no change", () => {
      const current = makeRow({ cutoff_kind: "unavailable" });
      const previous = makeRow({ cutoff_kind: "unavailable" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("unchanged");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(true);
    });

    it("unavailable → date is forward movement", () => {
      const current = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const previous = makeRow({ cutoff_kind: "unavailable" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("forward");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(false);
    });

    it("unavailable → current is forward movement", () => {
      const current = makeRow({ cutoff_kind: "current" });
      const previous = makeRow({ cutoff_kind: "unavailable" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("forward");
      expect(result.is_retrogression).toBe(false);
      expect(result.is_no_change).toBe(false);
    });

    it("date → unavailable is retrogression", () => {
      const current = makeRow({ cutoff_kind: "unavailable" });
      const previous = makeRow({
        cutoff_kind: "date",
        cutoff_date: "2013-09-15",
      });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("backward");
      expect(result.is_retrogression).toBe(true);
      expect(result.is_no_change).toBe(false);
    });

    it("current → unavailable is retrogression", () => {
      const current = makeRow({ cutoff_kind: "unavailable" });
      const previous = makeRow({ cutoff_kind: "current" });
      const result = calculateMovement(current, previous);

      expect(result.movement_days).toBeNull();
      expect(result.movement_direction).toBe("backward");
      expect(result.is_retrogression).toBe(true);
      expect(result.is_no_change).toBe(false);
    });
  });
});
