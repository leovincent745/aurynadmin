import { NextResponse } from "next/server";

import {
  InstructionServiceError,
} from "@/lib/services/instruction-service";
import {
  PromptHistoryServiceError,
} from "@/lib/services/prompt-history-service";
import {
  PromptValidationServiceError,
} from "@/lib/services/prompt-validation-service";

/** Standard error codes for Prompt System admin APIs. */
export type PromptApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "INVALID_BODY"
  | "IMMUTABLE";

export function promptApiJson(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, { status });
}

export function promptApiError(
  code: PromptApiErrorCode,
  status: number,
  options?: { message?: string; errors?: unknown },
): NextResponse {
  return promptApiJson(
    {
      code,
      ...(options?.message ? { message: options.message } : {}),
      ...(options?.errors !== undefined ? { errors: options.errors } : {}),
    },
    status,
  );
}

export function promptNotFound(message = "Prompt not found"): NextResponse {
  return promptApiError("NOT_FOUND", 404, { message });
}

export function promptRateLimited(): NextResponse {
  return promptApiError("RATE_LIMITED", 429, {
    message: "Too many requests. Try again shortly.",
  });
}

export function promptInternalError(logTag: string, error: unknown): NextResponse {
  console.error(logTag, error);
  return promptApiError("INTERNAL_ERROR", 500, {
    message: "An unexpected error occurred",
  });
}

export function handlePromptRouteError(
  error: unknown,
  logTag: string,
): NextResponse {
  if (error instanceof InstructionServiceError) {
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400;
    const code: PromptApiErrorCode =
      error.code === "VALIDATION" ? "VALIDATION" : error.code;
    return promptApiError(code, status, { message: error.message });
  }

  if (error instanceof PromptValidationServiceError) {
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400;
    return promptApiError(error.code, status, { message: error.message });
  }

  if (error instanceof PromptHistoryServiceError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "CONFLICT"
          ? 409
          : error.code === "IMMUTABLE"
            ? 403
            : 400;
    return promptApiError(error.code, status, { message: error.message });
  }

  return promptInternalError(logTag, error);
}
