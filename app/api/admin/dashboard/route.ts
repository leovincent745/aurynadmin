import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getAdminDashboardSummary } from "@/lib/services/instruction-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const summary = await getAdminDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("admin.dashboard.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
