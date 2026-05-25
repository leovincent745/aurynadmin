import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { logAdminAccessDenied } from "@/lib/auth/audit-log";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { guardAdminApiRoute } from "@/lib/auth/middleware-admin-guard";
import { isProtectedAdminPath } from "@/lib/auth/protected-routes";
import { isAdminRole } from "@/lib/auth/rbac";
import { verifySessionToken } from "@/lib/auth/session";

const legacyAdminRedirects: Record<string, string> = {
  "/admin/instructions": "/prompt-system",
  "/admin/test-chat": "/test-chat",
  "/admin/conversations": "/conversations",
  "/admin/ai-logs": "/ai-optimization-center",
  "/admin/users": "/users",
};

function resolveLegacyAdminRedirect(pathname: string): string | null {
  const exact = legacyAdminRedirects[pathname];
  if (exact) return exact;

  if (pathname.startsWith("/admin/conversations/")) {
    return pathname.replace("/admin/conversations", "/conversations");
  }
  if (pathname.startsWith("/admin/users/")) {
    return pathname.replace("/admin/users", "/users");
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    return guardAdminApiRoute(request);
  }

  const legacyTarget = resolveLegacyAdminRedirect(pathname);
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url));
  }

  const isProtected = isProtectedAdminPath(pathname);

  if (!isProtected && pathname !== "/access-denied") {
    return NextResponse.next();
  }

  if (pathname === "/access-denied") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
    });
    return response;
  }

  if (!isAdminRole(session.role)) {
    logAdminAccessDenied({
      userId: session.userId,
      role: session.role,
      path: pathname,
    });
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/prompt-system",
    "/prompt-system/:path*",
    "/ai-optimization-center",
    "/ai-optimization-center/:path*",
    "/conversations",
    "/conversations/:path*",
    "/users",
    "/users/:path*",
    "/test-chat",
    "/test-chat/:path*",
    "/root-pathways/:path*",
    "/access-denied",
  ],
};
