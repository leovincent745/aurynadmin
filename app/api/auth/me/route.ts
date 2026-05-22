import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/api-auth";
import { getPromptSystemPermissions } from "@/lib/auth/prompt-permissions";
import { getUserById } from "@/lib/services/auth-service";

export async function GET(request: Request) {
  const auth = await requireSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const user = await getUserById(auth.session.userId);
  if (!user) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  return NextResponse.json({
    user,
    promptSystem: getPromptSystemPermissions(user.role),
  });
}
