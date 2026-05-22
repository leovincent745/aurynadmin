import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  return NextResponse.json({
    ok: true,
    userId: auth.session.userId,
    role: auth.session.role,
  });
}
