import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { listUsers } from "@/lib/services/user-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listUsers({
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "20"),
      email: searchParams.get("email") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("admin.users.list.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
