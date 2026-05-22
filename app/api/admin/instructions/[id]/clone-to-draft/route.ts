import { NextResponse } from "next/server";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import {
  InstructionServiceError,
  cloneInstructionToDraft,
} from "@/lib/services/instruction-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "create");
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const draft = await cloneInstructionToDraft(id, auth.session.userId);
    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof InstructionServiceError && error.code === "NOT_FOUND") {
      return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    console.error("admin.instructions.clone-to-draft.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
