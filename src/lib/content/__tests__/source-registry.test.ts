/**
 * Tests for the source registry module.
 *
 * Verifies that the allowlist correctly classifies known government sources,
 * rejects unregistered domains, and returns proper tier / metadata.
 */

import { describe, it, expect } from "vitest";
import {
  isAllowedSource,
  getSourceTier,
  getSourceMetadata,
} from "../source-registry";

// ---------------------------------------------------------------------------
// isAllowedSource
// ---------------------------------------------------------------------------

describe("isAllowedSource", () => {
  it("allows a USCIS URL", () => {
    expect(
      isAllowedSource("https://www.uscis.gov/i-485")
    ).toBe(true);
  });

  it("allows a Department of State Visa Bulletin URL", () => {
    expect(
      isAllowedSource(
        "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-bulletin.html"
      )
    ).toBe(true);
  });

  it("allows a Federal Register URL", () => {
    expect(
      isAllowedSource("https://www.federalregister.gov/documents/2025/01/01/some-rule")
    ).toBe(true);
  });

  it("allows a DHS URL", () => {
    expect(isAllowedSource("https://www.dhs.gov/news/2025/01/01/update")).toBe(
      true
    );
  });

  it("rejects a random blog", () => {
    expect(
      isAllowedSource("https://randomimmigrationblog.com/article")
    ).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isAllowedSource("")).toBe(false);
  });

  it("rejects a URL with a similar but different domain", () => {
    expect(isAllowedSource("https://uscis-fake.gov/phishing")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSourceTier
// ---------------------------------------------------------------------------

describe("getSourceTier", () => {
  it("returns tier 1 for USCIS", () => {
    expect(getSourceTier("https://www.uscis.gov/working")).toBe(1);
  });

  it("returns tier 1 for DOS Visa Bulletin", () => {
    expect(
      getSourceTier("https://travel.state.gov/content/travel/en/us-visas")
    ).toBe(1);
  });

  it("returns tier 2 for Federal Register", () => {
    expect(getSourceTier("https://www.federalregister.gov/doc")).toBe(2);
  });

  it("returns tier 2 for DHS", () => {
    expect(getSourceTier("https://www.dhs.gov/policy")).toBe(2);
  });

  it("returns tier 3 for AILA", () => {
    expect(getSourceTier("https://www.aila.org/resources")).toBe(3);
  });

  it("returns null for an unknown domain", () => {
    expect(getSourceTier("https://example.com/article")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getSourceMetadata
// ---------------------------------------------------------------------------

describe("getSourceMetadata", () => {
  it("returns full metadata for a USCIS URL", () => {
    const meta = getSourceMetadata("https://www.uscis.gov/forms");
    expect(meta).toBeDefined();
    expect(meta!.id).toBe("uscis");
    expect(meta!.tier).toBe(1);
    expect(meta!.type).toBe("government");
    expect(meta!.trustLevel).toBe("authoritative");
  });

  it("returns undefined for an unregistered URL", () => {
    expect(getSourceMetadata("https://randomsite.com")).toBeUndefined();
  });

  it("returns metadata with correct name for DHS", () => {
    const meta = getSourceMetadata("https://www.dhs.gov");
    expect(meta).toBeDefined();
    expect(meta!.name).toContain("Homeland Security");
  });
});
