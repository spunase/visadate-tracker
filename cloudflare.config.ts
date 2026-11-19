import { bindings, defineConfig, defineWorker } from "cf/config";
import { createWorkersCacheConfig } from "@vinext/cloudflare/cache/config";

const cache = await createWorkersCacheConfig();

export default defineConfig({
  accountId: "e9c5ef84d197e0fdfc5fd1a589de4014",
  worker: defineWorker({
    ...cache,
    name: "visadate-tracker",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-19",
    compatibilityFlags: ["nodejs_compat"],
    observability: {
      enabled: true,
      headSamplingRate: 1,
      logs: {
        enabled: true,
        headSamplingRate: 1,
        invocationLogs: true,
        persist: true,
      },
      traces: {
        enabled: true,
        headSamplingRate: 0.1,
        persist: true,
      },
    },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ...cache.env,
      ASSETS: bindings.assets(),
      NEXT_PUBLIC_FIREBASE_API_KEY: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
          "AIzaSyAbVlkrMqbgKM8DyKX-v-kyXxq7RQlGxQk",
      ),
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
          "visatracker-491402.firebaseapp.com",
      ),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "visatracker-491402",
      ),
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
          "visatracker-491402.firebasestorage.app",
      ),
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1052859925070",
      ),
      NEXT_PUBLIC_FIREBASE_APP_ID: bindings.text(
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
          "1:1052859925070:web:1183a81266d0eca1e6f91f",
      ),
      FIREBASE_SERVICE_ACCOUNT_KEY: bindings.secret(),
      ADMIN_API_KEY: bindings.secret(),
    },
  }),
});
