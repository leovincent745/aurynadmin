import { NextResponse } from "next/server";

import {
  handlePromptRouteError,
  promptRateLimited,
} from "@/lib/api/prompt-api-errors";
import { checkPromptMutationRateLimit } from "@/lib/auth/prompt-mutation-rate-limit";
import { publishDraft } from "@/lib/services/instruction-service";
import type { InstructionRecord } from "@/lib/domain/admin-instructions";

export async function executePromptActivate(
  instructionId: string,
  adminUserId: string,
): Promise<NextResponse> {
  if (!checkPromptMutationRateLimit(adminUserId)) {
    return promptRateLimited();
  }

  try {
    const published = await publishDraft(instructionId, adminUserId);
    return activationResponse(published);
  } catch (error) {
    return handlePromptRouteError(error, "admin.prompts.activate.error");
  }
}

export function activationResponse(published: InstructionRecord): NextResponse {
  return NextResponse.json(
    {
      activated: published,
      published,
    },
    { status: 200 },
  );
}
