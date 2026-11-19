import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

async function createTestServiceAccountJson(): Promise<string> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
  const b64 = Buffer.from(pkcs8).toString("base64");
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  const pem = `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;

  return JSON.stringify({
    type: "service_account",
    project_id: "test-project-123",
    private_key_id: "key-id-1",
    private_key: pem,
    client_email: "sa@test-project-123.iam.gserviceaccount.com",
  });
}

describe("Firebase migration modules", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

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
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
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

  it("executes structured runQuery and handles empty results correctly", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = await createTestServiceAccountJson();

    const calls: Array<{ url: string; init?: RequestInit }> = [];
    let queryCount = 0;

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      calls.push({ url, init });

      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(
          JSON.stringify({ access_token: "mock-access-token", expires_in: 3600 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith(":runQuery")) {
        queryCount += 1;
        if (queryCount === 1) {
          return new Response(
            JSON.stringify([
              {
                document: {
                  name: "projects/test-project-123/databases/(default)/documents/visa_bulletins/2026-03",
                  fields: {
                    bulletin_month: { stringValue: "2026-03" },
                    is_published: { booleanValue: true },
                    row_count: { integerValue: "18" },
                    ratio: { doubleValue: 1.5 },
                    raw_snapshot_path: { nullValue: null },
                    tags: { arrayValue: { values: [{ stringValue: "eb" }] } },
                    meta: { mapValue: { fields: { year: { integerValue: "2026" } } } },
                  },
                },
              },
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        // Empty Firestore runQuery returns [{ readTime }] without document
        return new Response(JSON.stringify([{ readTime: "2026-11-18T00:00:00Z" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not found", { status: 404 });
    }) as typeof fetch;

    const { getAdminApp, getAdminDb } = await import("@/lib/firebase-admin");
    expect(getAdminApp()).toEqual({
      projectId: "test-project-123",
      clientEmail: "sa@test-project-123.iam.gserviceaccount.com",
    });

    const db = getAdminDb();
    expect(db).not.toBeNull();

    const snap = await db!
      .collection("visa_bulletins")
      .where("validation_status", "==", "published")
      .where("bulletin_month", "==", "2026-03")
      .orderBy("bulletin_month", "desc")
      .select("bulletin_month", "row_count")
      .limit(1)
      .get();

    expect(snap.empty).toBe(false);
    expect(snap.size).toBe(1);
    expect(snap.docs[0].id).toBe("2026-03");
    expect(snap.docs[0].data()).toEqual({
      bulletin_month: "2026-03",
      is_published: true,
      row_count: 18,
      ratio: 1.5,
      raw_snapshot_path: null,
      tags: ["eb"],
      meta: { year: 2026 },
    });

    const queryCall = calls.find((c) => c.url.endsWith(":runQuery"));
    const sentBody = JSON.parse(String(queryCall?.init?.body));
    expect(sentBody).toEqual({
      structuredQuery: {
        from: [{ collectionId: "visa_bulletins" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "validation_status" },
                  op: "EQUAL",
                  value: { stringValue: "published" },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "bulletin_month" },
                  op: "EQUAL",
                  value: { stringValue: "2026-03" },
                },
              },
            ],
          },
        },
        orderBy: [{ field: { fieldPath: "bulletin_month" }, direction: "DESCENDING" }],
        select: { fields: [{ fieldPath: "bulletin_month" }, { fieldPath: "row_count" }] },
        limit: 1,
      },
    });

    const emptySnap = await db!.collection("visa_bulletins").where("id", "==", "missing").get();
    expect(emptySnap.empty).toBe(true);
    expect(emptySnap.size).toBe(0);
    expect(emptySnap.docs).toEqual([]);

    // OAuth token should have been cached across the two Firestore calls
    const tokenCalls = calls.filter((c) => c.url === "https://oauth2.googleapis.com/token");
    expect(tokenCalls).toHaveLength(1);
  });

  it("supports document get (404 & 200), update with updateMask, and batch commit", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = await createTestServiceAccountJson();

    const calls: Array<{ url: string; method?: string; body?: unknown }> = [];

    globalThis.fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const body = init?.body ? String(init.body) : undefined;
      calls.push({ url, method: init?.method, body });

      if (url === "https://oauth2.googleapis.com/token") {
        return new Response(
          JSON.stringify({ access_token: "mock-access-token", expires_in: 3600 }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/documents/visa_bulletins/missing") && init?.method === "GET") {
        return new Response(JSON.stringify({ error: { code: 404 } }), { status: 404 });
      }

      if (url.endsWith("/documents/visa_bulletins/2026-03") && init?.method === "GET") {
        return new Response(
          JSON.stringify({
            name: "projects/test-project-123/databases/(default)/documents/visa_bulletins/2026-03",
            fields: { validation_status: { stringValue: "draft" } },
          }),
          { status: 200 },
        );
      }

      if (url.includes("/documents/visa_bulletins/2026-03?") && init?.method === "PATCH") {
        return new Response(JSON.stringify({ name: "ok" }), { status: 200 });
      }

      if (url.endsWith(":commit") && init?.method === "POST") {
        return new Response(JSON.stringify({ writeResults: [{}] }), { status: 200 });
      }

      return new Response("Unexpected request", { status: 500 });
    }) as typeof fetch;

    const { getAdminDb } = await import("@/lib/firebase-admin");
    const db = getAdminDb()!;

    const missingSnap = await db.collection("visa_bulletins").doc("missing").get();
    expect(missingSnap.exists).toBe(false);
    expect(missingSnap.data()).toBeUndefined();

    const docRef = db.collection("visa_bulletins").doc("2026-03");
    const foundSnap = await docRef.get();
    expect(foundSnap.exists).toBe(true);
    expect(foundSnap.data()).toEqual({ validation_status: "draft" });

    await docRef.update({
      validation_status: "validated",
      validated_at: "2026-11-18T12:00:00.000Z",
    });

    const patchCall = calls.find((c) => c.method === "PATCH");
    expect(patchCall?.url).toContain("currentDocument.exists=true");
    expect(patchCall?.url).toContain("updateMask.fieldPaths=validation_status");
    expect(patchCall?.url).toContain("updateMask.fieldPaths=validated_at");

    const batch = db.batch();
    batch.set(db.collection("visa_cutoff_rows").doc("row-1"), {
      bulletin_id: "2026-03",
      cutoff_date: null,
    });
    await batch.commit();

    const commitCall = calls.find((c) => c.url.endsWith(":commit"));
    const commitBody = JSON.parse(String(commitCall?.body));
    expect(commitBody).toEqual({
      writes: [
        {
          update: {
            name: "projects/test-project-123/databases/(default)/documents/visa_cutoff_rows/row-1",
            fields: {
              bulletin_id: { stringValue: "2026-03" },
              cutoff_date: { nullValue: null },
            },
          },
        },
      ],
    });
  });
});
