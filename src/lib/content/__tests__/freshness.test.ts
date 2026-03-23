/**
 * Tests for the freshness evaluation module.
 *
 * These tests pin the behaviour of each freshness helper against a fixed
 * "now" date so results are deterministic.
 */

import { describe, it, expect } from "vitest";
import {
  evaluateFreshness,
  getBulletinFreshness,
  getChartUseFreshness,
  getPolicyFreshness,
} from "../freshness";

// Fixed reference date: 2025-06-15
const NOW = new Date("2025-06-15T12:00:00Z");

// ---------------------------------------------------------------------------
// evaluateFreshness (general)
// ---------------------------------------------------------------------------

describe("evaluateFreshness", () => {
  it("returns fresh for content published today", () => {
    const result = evaluateFreshness("2025-06-15", "2025-07-15", "bulletin", NOW);
    expect(result.status).toBe("fresh");
    expect(result.daysOld).toBe(0);
    expect(result.warningMessage).toBeNull();
  });

  it("returns expired when expiry date is in the past", () => {
    const result = evaluateFreshness("2025-05-01", "2025-06-10", "policy", NOW);
    expect(result.status).toBe("expired");
    expect(result.daysUntilExpiry).toBeLessThan(0);
    expect(result.warningMessage).toContain("expired");
  });

  it("returns aging for content older than the aging threshold", () => {
    // 25 days old, bulletin aging threshold is 20
    const result = evaluateFreshness("2025-05-21", null, "bulletin", NOW);
    expect(result.status).toBe("aging");
    expect(result.daysOld).toBe(25);
    expect(result.warningMessage).toBeTruthy();
  });

  it("returns stale for content older than the stale threshold", () => {
    // 45 days old, bulletin stale threshold is 40
    const result = evaluateFreshness("2025-05-01", null, "bulletin", NOW);
    expect(result.status).toBe("stale");
    expect(result.daysOld).toBe(45);
    expect(result.warningMessage).toContain("outdated");
  });
});

// ---------------------------------------------------------------------------
// getBulletinFreshness
// ---------------------------------------------------------------------------

describe("getBulletinFreshness", () => {
  it("returns fresh for a bulletin whose month is the current month", () => {
    expect(getBulletinFreshness("2025-06", NOW)).toBe("fresh");
  });

  it("returns fresh for a bulletin published today (same month)", () => {
    expect(getBulletinFreshness("2025-06", new Date("2025-06-01T00:00:00Z"))).toBe("fresh");
  });

  it("returns aging for a bulletin from 25 days after its month ended", () => {
    // Bulletin for May 2025, now is June 25 → 25 days past June 1
    const jun25 = new Date("2025-06-25T12:00:00Z");
    expect(getBulletinFreshness("2025-05", jun25)).toBe("aging");
  });

  it("returns stale for a bulletin from 45 days after its month ended", () => {
    // Bulletin for April 2025, now is June 15 → 45 days past May 1
    expect(getBulletinFreshness("2025-04", NOW)).toBe("stale");
  });
});

// ---------------------------------------------------------------------------
// getChartUseFreshness
// ---------------------------------------------------------------------------

describe("getChartUseFreshness", () => {
  it("returns fresh for chart-use of the current month", () => {
    expect(getChartUseFreshness("2025-06", NOW)).toBe("fresh");
  });

  it("returns expired for chart-use of last month", () => {
    expect(getChartUseFreshness("2025-05", NOW)).toBe("expired");
  });

  it("returns fresh for a future month", () => {
    expect(getChartUseFreshness("2025-07", NOW)).toBe("fresh");
  });

  it("returns expired even one day after the month ends", () => {
    const jul1 = new Date("2025-07-01T12:00:00Z");
    expect(getChartUseFreshness("2025-06", jul1)).toBe("expired");
  });
});

// ---------------------------------------------------------------------------
// getPolicyFreshness
// ---------------------------------------------------------------------------

describe("getPolicyFreshness", () => {
  it("returns fresh for a policy with a future expiry", () => {
    expect(getPolicyFreshness("2025-06-10", "2025-12-31", NOW)).toBe("fresh");
  });

  it("returns expired for a policy with a past expiry", () => {
    expect(getPolicyFreshness("2025-01-01", "2025-06-01", NOW)).toBe("expired");
  });

  it("returns aging for an old policy that has not yet expired", () => {
    // Published 25 days ago, expires far in the future
    expect(getPolicyFreshness("2025-05-26", "2026-01-01", NOW)).toBe("aging");
  });

  it("returns stale for a very old policy that has not yet expired", () => {
    // Published 40 days ago (May 6), not yet expired
    expect(getPolicyFreshness("2025-05-06", "2026-01-01", NOW)).toBe("stale");
  });
});
