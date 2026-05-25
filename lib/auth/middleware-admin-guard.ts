import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { logAdminAccessDenied } from "@/lib/auth/audit-log";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { isAdminRole } from "@/lib/auth/rbac";
import { clearSessionCookieOptions, verifySessionToken } from "@/lib/auth/session";

export function adminApiUnauthorizedResponse(): NextResponse {
  return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
}

export function adminApiForbiddenResponse(): NextResponse {
  return NextResponse.json(
    { code: "FORBIDDEN", message: "Admin access required" },
    { status: 403 },
  );
}

/**
 * Enforces admin session on `/api/admin/*` before route handlers run.
 */
export async function guardAdminApiRoute(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return adminApiUnauthorizedResponse();
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const response = adminApiUnauthorizedResponse();
    response.cookies.set(clearSessionCookieOptions());
    return response;
  }

  if (!isAdminRole(session.role)) {
    logAdminAccessDenied({
      userId: session.userId,
      role: session.role,
      path: pathname,
    });
    return adminApiForbiddenResponse();
  }

  return NextResponse.next();
}
