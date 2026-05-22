import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import { recordPhysicianApproval } from "@/lib/services/prompt-activation-service";
import { getPromptGovernanceSnapshot } from "@/lib/services/prompt-validation-service";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  comment: z.string().trim().max(4000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "physician-approval");
  if ("response" in auth) return auth.response;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "VALIDATION", message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const approval = await recordPhysicianApproval({
      instructionId: id,
      physicianUserId: auth.session.userId,
      action: parsed.data.action,
      comment: parsed.data.comment,
    });
    const governance = await getPromptGovernanceSnapshot(id);
    return NextResponse.json({ approval, governance });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status =
      message === "NOT_FOUND" ? 404 : message === "ONLY_IN_REVIEW" ? 400 : 500;
    return NextResponse.json({ code: message, message }, { status });
  }
}
