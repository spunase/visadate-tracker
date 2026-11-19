import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Static NEXT_PUBLIC_FIREBASE_* accesses are required so Next.js inlines them
 * into browser bundles at build time.
 */
function readFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.firebasestorage.app`,
    messagingSenderId,
    appId,
  };
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

/**
 * Returns the initialized client FirebaseApp, or null when running on the server
 * or when Firebase client environment variables are not configured.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (cachedApp) return cachedApp;

  if (getApps().length > 0) {
    cachedApp = getApp();
    return cachedApp;
  }

  const config = readFirebaseConfig();
  if (!config) return null;

  cachedApp = initializeApp(config);
  return cachedApp;
}

/**
 * Returns the Firebase Auth instance for browser-side sign-in, or null if unconfigured.
 */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!cachedAuth) {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

/**
 * Returns the client Firestore instance for user-scoped reads/writes, or null if unconfigured.
 */
export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!cachedDb) {
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}
