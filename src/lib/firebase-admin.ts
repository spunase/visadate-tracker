/**
 * Lightweight Firebase Admin Firestore client for Cloudflare Workers (`workerd`) and Node.js.
 *
 * Uses standard Web Crypto (`crypto.subtle`) RS256 service-account JWTs and the
 * Cloud Firestore REST v1 API instead of `firebase-admin` / `@grpc/grpc-js`.
 */

interface ServiceAccountJson {
  project_id?: string;
  private_key_id?: string;
  private_key?: string;
  client_email?: string;
}

export type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { referenceValue: string }
  | { bytesValue: string };

export interface AdminApp {
  projectId: string;
  clientEmail: string;
}

export interface AdminDocumentSnapshot {
  id: string;
  exists: boolean;
  data: () => Record<string, unknown> | undefined;
}

export interface AdminQueryDocumentSnapshot {
  id: string;
  exists: true;
  data: () => Record<string, unknown>;
}

export interface AdminQuerySnapshot {
  empty: boolean;
  size: number;
  docs: AdminQueryDocumentSnapshot[];
}

export interface AdminDocumentRef {
  id: string;
  collectionName: string;
  path: string;
  get: () => Promise<AdminDocumentSnapshot>;
  set: (data: Record<string, unknown>) => Promise<void>;
  update: (data: Record<string, unknown>) => Promise<void>;
}

export type WhereFilterOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "in"
  | "array-contains";

export type OrderByDirection = "asc" | "desc";

export interface AdminQuery {
  where: (field: string, op: WhereFilterOp, value: unknown) => AdminQuery;
  orderBy: (field: string, direction?: OrderByDirection) => AdminQuery;
  limit: (count: number) => AdminQuery;
  select: (...fields: string[]) => AdminQuery;
  get: () => Promise<AdminQuerySnapshot>;
}

export interface AdminCollectionRef extends AdminQuery {
  doc: (id: string) => AdminDocumentRef;
}

export interface AdminWriteBatch {
  set: (docRef: AdminDocumentRef, data: Record<string, unknown>) => AdminWriteBatch;
  commit: () => Promise<void>;
}

export interface AdminFirestore {
  projectId: string;
  collection: (name: string) => AdminCollectionRef;
  batch: () => AdminWriteBatch;
}

interface CachedCredentials {
  rawKey: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
  privateKeyId?: string;
}

interface TokenCacheEntry {
  token: string;
  expiresAtMs: number;
}

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

const OP_MAP: Record<WhereFilterOp, string> = {
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  in: "IN",
  "array-contains": "ARRAY_CONTAINS",
};

let cachedCreds: CachedCredentials | null = null;
let cachedApp: AdminApp | null = null;
let cachedDb: AdminFirestore | null = null;
const tokenCache = new Map<string, TokenCacheEntry>();

function parseServiceAccount(raw: string): CachedCredentials | null {
  try {
    const parsed = JSON.parse(raw) as ServiceAccountJson;
    const projectId = parsed.project_id ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = parsed.client_email;
    const rawPrivateKey = parsed.private_key;

    if (!projectId || !clientEmail || !rawPrivateKey || typeof rawPrivateKey !== "string") {
      console.warn("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON.");
      return null;
    }

    return {
      rawKey: raw,
      projectId,
      clientEmail,
      privateKey: rawPrivateKey.replace(/\\n/g, "\n"),
      privateKeyId: parsed.private_key_id,
    };
  } catch {
    console.warn("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON.");
    return null;
  }
}

function getCredentials(): CachedCredentials | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    cachedCreds = null;
    cachedApp = null;
    cachedDb = null;
    return null;
  }

  if (cachedCreds && cachedCreds.rawKey === raw) {
    return cachedCreds;
  }

  const creds = parseServiceAccount(raw);
  if (!creds) {
    cachedCreds = null;
    cachedApp = null;
    cachedDb = null;
    return null;
  }

  cachedCreds = creds;
  cachedApp = null;
  cachedDb = null;
  return creds;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeJsonBase64Url(value: unknown): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToPkcs8Bytes(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getAccessToken(creds: CachedCredentials): Promise<string> {
  const cacheKey = `${creds.projectId}:${creds.clientEmail}`;
  const nowMs = Date.now();
  const cached = tokenCache.get(cacheKey);
  if (cached && nowMs < cached.expiresAtMs - TOKEN_REFRESH_BUFFER_MS) {
    return cached.token;
  }

  const nowSec = Math.floor(nowMs / 1000);
  const header = encodeJsonBase64Url({
    alg: "RS256",
    typ: "JWT",
    ...(creds.privateKeyId ? { kid: creds.privateKeyId } : {}),
  });
  const payload = encodeJsonBase64Url({
    iss: creds.clientEmail,
    sub: creds.clientEmail,
    aud: OAUTH_TOKEN_URL,
    scope: FIRESTORE_SCOPE,
    iat: nowSec,
    exp: nowSec + 3600,
  });

  const unsignedJwt = `${header}.${payload}`;
  const keyBytes = pemToPkcs8Bytes(creds.privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedJwt),
  );
  const assertion = `${unsignedJwt}.${toBase64Url(new Uint8Array(signature))}`;

  const tokenRes = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(assertion)}`,
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Firebase OAuth2 token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string; expires_in?: number };
  if (!tokenData.access_token) {
    throw new Error("Firebase OAuth2 token response missing access_token.");
  }

  const expiresInMs = (tokenData.expires_in ?? 3600) * 1000;
  tokenCache.set(cacheKey, {
    token: tokenData.access_token,
    expiresAtMs: nowMs + expiresInMs,
  });

  return tokenData.access_token;
}

/**
 * Encodes a JS value into the Cloud Firestore REST v1 typed value representation.
 */
export function encodeFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "string") {
    return { stringValue: value };
  }
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeFirestoreValue) } };
  }
  if (typeof value === "object") {
    return { mapValue: { fields: encodeFirestoreFields(value as Record<string, unknown>) } };
  }
  return { stringValue: String(value) };
}

/**
 * Encodes a flat/nested object into a Firestore REST v1 field map.
 */
export function encodeFirestoreFields(
  obj: Record<string, unknown>,
): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [key, val] of Object.entries(obj)) {
    fields[key] = encodeFirestoreValue(val);
  }
  return fields;
}

/**
 * Decodes a Cloud Firestore REST v1 typed value into a standard JS value.
 */
export function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  }
  if ("mapValue" in value) {
    return decodeFirestoreFields(value.mapValue.fields ?? {});
  }
  if ("referenceValue" in value) return value.referenceValue;
  if ("bytesValue" in value) return value.bytesValue;
  return null;
}

/**
 * Decodes a Firestore REST v1 document field map into a plain JS record.
 */
export function decodeFirestoreFields(
  fields: Record<string, FirestoreValue>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = decodeFirestoreValue(val);
  }
  return result;
}

interface QueryState {
  collectionName: string;
  filters: Array<{ field: string; op: string; value: FirestoreValue }>;
  orders: Array<{ field: string; direction: "ASCENDING" | "DESCENDING" }>;
  limitCount?: number;
  selectFields?: string[];
}

interface FirestoreRestDoc {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface RunQueryRow {
  document?: FirestoreRestDoc;
  readTime?: string;
}

function createQueryBuilder(creds: CachedCredentials, state: QueryState): AdminQuery {
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(creds.projectId)}/databases/(default)/documents`;

  return {
    where(field: string, op: WhereFilterOp, value: unknown): AdminQuery {
      const firestoreOp = OP_MAP[op];
      if (!firestoreOp) {
        throw new Error(`Firestore unsupported query operator: ${op}`);
      }
      return createQueryBuilder(creds, {
        ...state,
        filters: [
          ...state.filters,
          { field, op: firestoreOp, value: encodeFirestoreValue(value) },
        ],
      });
    },

    orderBy(field: string, direction: OrderByDirection = "asc"): AdminQuery {
      return createQueryBuilder(creds, {
        ...state,
        orders: [
          ...state.orders,
          { field, direction: direction === "desc" ? "DESCENDING" : "ASCENDING" },
        ],
      });
    },

    limit(count: number): AdminQuery {
      return createQueryBuilder(creds, {
        ...state,
        limitCount: count,
      });
    },

    select(...fields: string[]): AdminQuery {
      return createQueryBuilder(creds, {
        ...state,
        selectFields: fields,
      });
    },

    async get(): Promise<AdminQuerySnapshot> {
      const token = await getAccessToken(creds);
      const structuredQuery: Record<string, unknown> = {
        from: [{ collectionId: state.collectionName }],
      };

      if (state.filters.length === 1) {
        const f = state.filters[0];
        structuredQuery.where = {
          fieldFilter: {
            field: { fieldPath: f.field },
            op: f.op,
            value: f.value,
          },
        };
      } else if (state.filters.length > 1) {
        structuredQuery.where = {
          compositeFilter: {
            op: "AND",
            filters: state.filters.map((f) => ({
              fieldFilter: {
                field: { fieldPath: f.field },
                op: f.op,
                value: f.value,
              },
            })),
          },
        };
      }

      if (state.orders.length > 0) {
        structuredQuery.orderBy = state.orders.map((o) => ({
          field: { fieldPath: o.field },
          direction: o.direction,
        }));
      }

      if (state.selectFields && state.selectFields.length > 0) {
        structuredQuery.select = {
          fields: state.selectFields.map((fieldPath) => ({ fieldPath })),
        };
      }

      if (state.limitCount !== undefined) {
        structuredQuery.limit = state.limitCount;
      }

      const res = await fetch(`${baseUrl}:runQuery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredQuery }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Firestore runQuery failed (${res.status}): ${errText}`);
      }

      const rows = (await res.json()) as RunQueryRow[];
      const docs: AdminQueryDocumentSnapshot[] = [];

      for (const row of rows) {
        if (!row.document) continue;
        const docId = row.document.name.split("/").pop() ?? "";
        const decoded = decodeFirestoreFields(row.document.fields ?? {});
        docs.push({
          id: docId,
          exists: true,
          data: () => decoded,
        });
      }

      return {
        empty: docs.length === 0,
        size: docs.length,
        docs,
      };
    },
  };
}

function createDocumentRef(
  creds: CachedCredentials,
  collectionName: string,
  id: string,
): AdminDocumentRef {
  const path = `projects/${creds.projectId}/databases/(default)/documents/${collectionName}/${id}`;
  const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(creds.projectId)}/databases/(default)/documents/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`;

  return {
    id,
    collectionName,
    path,

    async get(): Promise<AdminDocumentSnapshot> {
      const token = await getAccessToken(creds);
      const res = await fetch(docUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 404) {
        return {
          id,
          exists: false,
          data: () => undefined,
        };
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Firestore document get failed (${res.status}): ${errText}`);
      }

      const docJson = (await res.json()) as FirestoreRestDoc;
      const decoded = decodeFirestoreFields(docJson.fields ?? {});
      return {
        id,
        exists: true,
        data: () => decoded,
      };
    },

    async set(data: Record<string, unknown>): Promise<void> {
      const token = await getAccessToken(creds);
      const res = await fetch(docUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: encodeFirestoreFields(data) }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Firestore document set failed (${res.status}): ${errText}`);
      }
    },

    async update(data: Record<string, unknown>): Promise<void> {
      const keys = Object.keys(data);
      if (keys.length === 0) return;

      const token = await getAccessToken(creds);
      const params = new URLSearchParams();
      params.set("currentDocument.exists", "true");
      for (const key of keys) {
        params.append("updateMask.fieldPaths", key);
      }

      const res = await fetch(`${docUrl}?${params.toString()}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: encodeFirestoreFields(data) }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Firestore document update failed (${res.status}): ${errText}`);
      }
    },
  };
}

function createFirestoreClient(creds: CachedCredentials): AdminFirestore {
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(creds.projectId)}/databases/(default)/documents:commit`;

  return {
    projectId: creds.projectId,

    collection(name: string): AdminCollectionRef {
      const query = createQueryBuilder(creds, {
        collectionName: name,
        filters: [],
        orders: [],
      });

      return {
        ...query,
        doc(id: string): AdminDocumentRef {
          return createDocumentRef(creds, name, id);
        },
      };
    },

    batch(): AdminWriteBatch {
      const writes: Array<{
        update: {
          name: string;
          fields: Record<string, FirestoreValue>;
        };
      }> = [];

      const batch: AdminWriteBatch = {
        set(docRef: AdminDocumentRef, data: Record<string, unknown>): AdminWriteBatch {
          writes.push({
            update: {
              name: docRef.path,
              fields: encodeFirestoreFields(data),
            },
          });
          return batch;
        },

        async commit(): Promise<void> {
          if (writes.length === 0) return;

          const token = await getAccessToken(creds);
          const res = await fetch(commitUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ writes }),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Firestore batch commit failed (${res.status}): ${errText}`);
          }
        },
      };

      return batch;
    },
  };
}

/**
 * Returns the server-side Firebase Admin App metadata, or null if credentials are not configured.
 * Allows API routes to gracefully fall back to mock data in test/CI environments.
 */
export function getAdminApp(): AdminApp | null {
  const creds = getCredentials();
  if (!creds) return null;

  if (!cachedApp) {
    cachedApp = {
      projectId: creds.projectId,
      clientEmail: creds.clientEmail,
    };
  }
  return cachedApp;
}

/**
 * Returns the server-side Firestore REST client using Firebase service account credentials,
 * or null if credentials are not configured.
 */
export function getAdminDb(): AdminFirestore | null {
  const creds = getCredentials();
  if (!creds) return null;

  if (!cachedDb) {
    cachedDb = createFirestoreClient(creds);
  }
  return cachedDb;
}
