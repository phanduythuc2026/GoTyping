import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { NextRequest } from "next/server";

/**
 * Constant-time string comparison preventing timing attack vulnerabilities
 */
export function timingSafeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const aBuffer = Buffer.from(a, "utf-8");
  const bBuffer = Buffer.from(b, "utf-8");

  if (aBuffer.length !== bBuffer.length) {
    // Constant-time dummy comparison to prevent length disclosure timing leaks
    crypto.timingSafeEqual(aBuffer, aBuffer);
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

/**
 * Server Component & Server Action Guard for Super Admin Boundary.
 * Immediately invokes notFound() to return 404 and avoid disclosing endpoint existence.
 */
export async function assertSuperAdmin() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("gotyping_role")?.value;

  // 1. Check local session cookie with constant-time comparison
  const hasValidCookie = timingSafeCompare(roleCookie, "super_admin");

  // 2. Verify with Supabase Server client if authenticated
  let isSuperAdmin = hasValidCookie;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user) {
      // Check app_metadata (strictly server-writable only, never user_metadata)
      const appRole = user.app_metadata?.role;
      if (timingSafeCompare(appRole, "super_admin")) {
        isSuperAdmin = true;
      }
    }
  } catch {
    // Fail closed if server check encounters network anomaly
  }

  if (!isSuperAdmin) {
    notFound(); // 404: Zero endpoint disclosure
  }

  return { isAuthorized: true };
}

/**
 * Server Boundary Guard for API Routes (NextRequest).
 * Returns boolean whether request is from an authorized Super Admin.
 */
export function isAuthorizedSuperAdmin(req: NextRequest): boolean {
  const roleCookie = req.cookies.get("gotyping_role")?.value;
  const adminSecretHeader = req.headers.get("x-admin-secret");

  // Constant-time check on role cookie
  const isCookieSuperAdmin = timingSafeCompare(roleCookie, "super_admin");

  // Optional internal server-to-server admin secret check
  const serverSecret = process.env.ADMIN_INTERNAL_SECRET;
  const isSecretValid =
    serverSecret && adminSecretHeader
      ? timingSafeCompare(adminSecretHeader, serverSecret)
      : false;

  return isCookieSuperAdmin || isSecretValid;
}
