import { NextResponse } from "next/server";

/**
 * Validates admin API requests using a shared secret (ADMIN_API_KEY).
 *
 * Expects the key in the `Authorization: Bearer <key>` header.
 * Returns a 401 response if the key is missing or invalid.
 * Returns null if the request is authorized.
 */
export function requireAdminAuth(request: Request): NextResponse | null {
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    // In development without a key configured, allow access with a warning
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return NextResponse.json(
      { success: false, error: "Server misconfiguration: admin key not set" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: missing Bearer token" },
      { status: 401 },
    );
  }

  const token = authHeader.slice("Bearer ".length);

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(token, adminKey)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }

  return null;
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
