/**
 * Runtime environment variable validation.
 *
 * Import this module in server entry points to ensure required env vars are set.
 * In development, missing vars trigger warnings. In production, missing
 * critical vars will cause a clear startup error.
 */

interface EnvVar {
  name: string;
  required: "production" | "always" | "never";
}

const ENV_VARS: EnvVar[] = [
  { name: "NEXT_PUBLIC_FIREBASE_API_KEY", required: "never" },
  { name: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", required: "never" },
  { name: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", required: "never" },
  { name: "NEXT_PUBLIC_FIREBASE_APP_ID", required: "never" },
  { name: "FIREBASE_SERVICE_ACCOUNT_KEY", required: "never" },
  { name: "ADMIN_API_KEY", required: "production" },
];

function validateEnv(): void {
  const isProd = process.env.NODE_ENV === "production";
  const missing: string[] = [];

  for (const v of ENV_VARS) {
    const value = process.env[v.name];
    if (!value) {
      if (v.required === "always" || (v.required === "production" && isProd)) {
        missing.push(v.name);
      }
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    if (isProd) {
      throw new Error(msg);
    } else {
      console.warn(`[env] ${msg}`);
    }
  }
}

validateEnv();

export {};
