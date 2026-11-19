import {
  initializeApp,
  getApps,
  getApp,
  cert,
  applicationDefault,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedAdminApp: App | null = null;
let cachedAdminDb: Firestore | null = null;

function parseServiceAccount(raw: string): ServiceAccount | null {
  try {
    const parsed = JSON.parse(raw) as ServiceAccount & {
      private_key?: string;
    };
    if (parsed.private_key && typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  } catch {
    console.warn("[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON.");
    return null;
  }
}

/**
 * Returns the server-side Firebase Admin App, or null if credentials are not configured.
 * Allows API routes to gracefully fall back to mock data in test/CI environments.
 */
export function getAdminApp(): App | null {
  if (cachedAdminApp) return cachedAdminApp;

  if (getApps().length > 0) {
    cachedAdminApp = getApp();
    return cachedAdminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    const sa = parseServiceAccount(serviceAccountJson);
    if (!sa) return null;

    cachedAdminApp = initializeApp({
      credential: cert(sa),
      projectId:
        (sa as { project_id?: string }).project_id ??
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return cachedAdminApp;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    cachedAdminApp = initializeApp({
      credential: applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return cachedAdminApp;
  }

  return null;
}

/**
 * Returns the server-side Firestore instance using Firebase Admin credentials,
 * or null if credentials are not configured.
 */
export function getAdminDb(): Firestore | null {
  if (cachedAdminDb) return cachedAdminDb;

  const app = getAdminApp();
  if (!app) return null;

  cachedAdminDb = getFirestore(app);
  return cachedAdminDb;
}
