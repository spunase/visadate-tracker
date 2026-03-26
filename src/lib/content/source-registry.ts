/**
 * Source allowlist and metadata for VisaDateTracker.
 *
 * Only sources present in this registry may be cited in the app. Every URL
 * is matched against registered base URLs so that unvetted blogs or
 * forums cannot accidentally appear as authoritative content.
 *
 * @module content/source-registry
 */

import type { SourceInfo, SourceTier } from "./types";

/**
 * Canonical list of allowed content sources, ordered by tier.
 */
export const ALLOWED_SOURCES: SourceInfo[] = [
  // ── Tier 1: Strongly preferred for MVP ──────────────────────────────
  {
    id: "uscis",
    name: "U.S. Citizenship and Immigration Services (USCIS)",
    tier: 1,
    baseUrl: "https://www.uscis.gov",
    type: "government",
    trustLevel: "authoritative",
  },
  {
    id: "dos-visa-bulletin",
    name: "Department of State - Visa Bulletin",
    tier: 1,
    baseUrl: "https://travel.state.gov",
    type: "government",
    trustLevel: "authoritative",
  },

  // ── Tier 2: Official federal sources ────────────────────────────────
  {
    id: "federal-register",
    name: "Federal Register",
    tier: 2,
    baseUrl: "https://www.federalregister.gov",
    type: "government",
    trustLevel: "official",
  },
  {
    id: "dhs",
    name: "Department of Homeland Security (DHS)",
    tier: 2,
    baseUrl: "https://www.dhs.gov",
    type: "government",
    trustLevel: "official",
  },

  // ── Tier 3: Reputable legal commentary (labeled as secondary) ──────
  {
    id: "aila",
    name: "American Immigration Lawyers Association (AILA)",
    tier: 3,
    baseUrl: "https://www.aila.org",
    type: "legal_commentary",
    trustLevel: "secondary",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a URL so it can be prefix-matched against base URLs.
 *
 * Strips trailing slashes and lowercases.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`.toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/+$/, "");
  }
}

/**
 * Find the source entry whose `baseUrl` matches the given URL.
 *
 * @param url - Any URL (article link, PDF, etc.).
 * @returns The matching {@link SourceInfo} or `undefined`.
 */
function findSource(url: string): SourceInfo | undefined {
  const normalized = normalizeUrl(url);
  return ALLOWED_SOURCES.find((s) => {
    const base = normalizeUrl(s.baseUrl);
    return normalized === base || normalized.startsWith(base);
  });
}

/**
 * Check whether a URL belongs to an allowed source.
 *
 * @param url - The URL to verify.
 * @returns `true` if the URL's origin matches a registered source.
 */
export function isAllowedSource(url: string): boolean {
  return findSource(url) !== undefined;
}

/**
 * Return the trust tier for a URL.
 *
 * @param url - The URL to look up.
 * @returns The tier (1, 2, or 3) or `null` if the source is not registered.
 */
export function getSourceTier(url: string): SourceTier | null {
  return findSource(url)?.tier ?? null;
}

/**
 * Return full metadata for a URL's source.
 *
 * @param url - The URL to look up.
 * @returns The {@link SourceInfo} object or `undefined` if unregistered.
 */
export function getSourceMetadata(url: string): SourceInfo | undefined {
  return findSource(url);
}
