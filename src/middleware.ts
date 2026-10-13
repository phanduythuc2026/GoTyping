import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get("gotyping_role")?.value;
  const isMaintenanceActive = request.cookies.get("gotyping_maintenance_active")?.value === "true";

  // 1. Maintenance Mode Lockdown Guard (Super Admin Bypassed)
  if (isMaintenanceActive && roleCookie !== "super_admin") {
    if (
      !pathname.startsWith("/maintenance") &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/api")
    ) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  // 2. Strict Zero-Trust RBAC protection for /admin routes
  // Unauthorized requests receive 404 Not Found to prevent endpoint enumeration
  if (pathname.startsWith("/admin")) {
    if (roleCookie !== "super_admin") {
      return NextResponse.rewrite(new URL("/_not-found", request.url), {
        status: 404,
      });
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    "/((?!_next/static|_next/image|favicon.ico|dictionaries/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
