import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { getPipelineHealthMonitor } from "@/lib/services/prompt-performance-service";
import { getPromptSystemSummary } from "@/lib/services/prompt-system-summary-service";

const querySchema = z.object({
  status: z.enum(["all", "active", "in_review", "archived"]).optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
  });

  try {
    const summary = await getPromptSystemSummary({
      status: parsed.success ? parsed.data.status : "all",
    });
    const health = await getPipelineHealthMonitor(summary);
    return NextResponse.json(health);
  } catch (error) {
    console.error("admin.prompts.health.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
