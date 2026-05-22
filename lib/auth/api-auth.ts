import { NextResponse } from "next/server";

import {
  getPromptSystemPermissions,
  hasPromptPermission,
  type PromptPermission,
} from "./prompt-permissions";
import { isAdminRole } from "./rbac";
import { getSessionFromRequest } from "./request-session";
import type { SessionUser } from "./types";

export type { PromptPermission };

export async function requireSession(
  request: Request,
): Promise<{ session: SessionUser } | { response: NextResponse }> {
  const session = await getSessionFromRequest(request as import("next/server").NextRequest);
  if (!session) {
    return { response: NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 }) };
  }
  return { session };
}

/** Any admin-console role (including read-only viewer). */
export async function requireAdminSession(
  request: Request,
): Promise<{ session: SessionUser } | { response: NextResponse }> {
  const result = await requireSession(request);
  if ("response" in result) return result;

  if (!isAdminRole(result.session.role)) {
    return { response: NextResponse.json({ code: "FORBIDDEN" }, { status: 403 }) };
  }

  return result;
}

/** @deprecated Prefer requirePromptPermission(request, "edit") */
export async function requirePromptEditorSession(
  request: Request,
): Promise<{ session: SessionUser } | { response: NextResponse }> {
  return requirePromptPermission(request, "edit");
}

export async function requirePromptPermission(
  request: Request,
  permission: PromptPermission,
): Promise<
  | { session: SessionUser; permissions: ReturnType<typeof getPromptSystemPermissions> }
  | { response: NextResponse }
> {
  const result = await requireAdminSession(request);
  if ("response" in result) return result;

  const permissions = getPromptSystemPermissions(result.session.role);
  if (!hasPromptPermission(permissions, permission)) {
    return {
      response: NextResponse.json(
        {
          code: "FORBIDDEN",
          message: `Missing permission: ${permission}`,
        },
        { status: 403 },
      ),
    };
  }

  return { session: result.session, permissions };
}
