import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getActivePublished } from "@/lib/services/instruction-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const active = await getActivePublished();
    if (!active) {
      return NextResponse.json({ active: null });
    }

    return NextResponse.json({
      active: {
        id: active.id,
        versionNumber: active.versionNumber,
        publishedAt: active.publishedAt?.toISOString() ?? null,
        publishedByEmail: active.creator.email,
        updatedAt: active.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("admin.instructions.active.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
