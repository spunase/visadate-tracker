import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Firebase migration modules", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns null for Firebase client helpers when env vars are missing", async () => {
    const { getFirebaseApp, getFirebaseAuth, getFirebaseDb } = await import(
      "@/lib/firebase"
    );
    expect(getFirebaseApp()).toBeNull();
    expect(getFirebaseAuth()).toBeNull();
    expect(getFirebaseDb()).toBeNull();
  });

  it("returns null for Firebase Admin helpers when credentials are missing", async () => {
    const { getAdminApp, getAdminDb } = await import("@/lib/firebase-admin");
    expect(getAdminApp()).toBeNull();
    expect(getAdminDb()).toBeNull();
  });

  it("returns null cleanly if FIREBASE_SERVICE_ACCOUNT_KEY is malformed JSON", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = "{not-valid-json";
    const { getAdminApp, getAdminDb } = await import("@/lib/firebase-admin");
    expect(getAdminApp()).toBeNull();
    expect(getAdminDb()).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
