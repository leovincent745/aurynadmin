import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { listInstructionHistory } from "@/lib/services/instruction-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "20");

  try {
    const history = await listInstructionHistory(
      Number.isFinite(page) ? page : 1,
      Number.isFinite(limit) ? limit : 20,
    );
    return NextResponse.json(history);
  } catch (error) {
    console.error("admin.instructions.history.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
