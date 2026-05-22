import { executePromptActivate } from "@/lib/api/prompt-activate-handler";
import { promptApiError } from "@/lib/api/prompt-api-errors";
import { requirePromptPermission } from "@/lib/auth/api-auth";
import { parsePromptIdParam } from "@/lib/validation/prompt-api-common";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Spec: POST /admin/prompts/{id}/activate — publish working draft to production. */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePromptPermission(request, "activate");
  if ("response" in auth) return auth.response;

  const { id: rawId } = await context.params;
  const idParsed = parsePromptIdParam(rawId);
  if (!idParsed.ok) {
    return promptApiError("VALIDATION", 400, {
      message: "Invalid prompt id",
      errors: idParsed.error.flatten(),
    });
  }

  return executePromptActivate(idParsed.id, auth.session.userId);
}
