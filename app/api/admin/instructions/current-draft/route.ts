import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/api-auth";
import { emptyInstructionTemplate } from "@/lib/constants/default-instructions";
import { getCurrentDraftResponse } from "@/lib/services/instruction-service";

export async function GET(request: Request) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const payload = await getCurrentDraftResponse();

    if (payload.isNew && !payload.draft) {
      return NextResponse.json({
        ...payload,
        template: emptyInstructionTemplate,
      });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("admin.instructions.current-draft.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
