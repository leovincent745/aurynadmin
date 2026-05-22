import { NextResponse } from "next/server";

import { requirePromptPermission } from "@/lib/auth/api-auth";
import { saveDraft } from "@/lib/services/instruction-service";
import { instructionContentSchema } from "@/lib/validation/instruction-schema";

async function handleSaveDraft(request: Request) {
  const auth = await requirePromptPermission(request, "edit");
  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = instructionContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const draft = await saveDraft(parsed.data, auth.session.userId);
    return NextResponse.json({ draft });
  } catch (error) {
    console.error("admin.instructions.draft.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleSaveDraft(request);
}

export async function POST(request: Request) {
  return handleSaveDraft(request);
}
