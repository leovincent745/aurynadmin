import { NextResponse } from "next/server";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import { createNewInstructionDraft } from "@/lib/services/instruction-service";

export async function POST(request: Request) {
  const auth = await requirePromptPermission(request, "create");
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const draft = await createNewInstructionDraft(auth.session.userId);
    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    console.error("admin.instructions.new_draft.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
