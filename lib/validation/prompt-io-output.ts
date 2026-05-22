import { z } from "zod";

import type {
  OutputValidationContext,
  PayloadValidationResult,
  PromptIoFieldSchema,
  ValidationIssue,
} from "@/lib/domain/prompt-io-schema";

const CUID_REGEX = /^c[a-z0-9]{24}$/i;

function issue(path: string, message: string): ValidationIssue {
  return { path, message };
}

function isNullish(value: unknown): boolean {
  return value === null || value === undefined;
}

function validateOutputField(
  field: PromptIoFieldSchema,
  value: unknown,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const path = field.key;

  if (isNullish(value)) {
    if (field.required) {
      issues.push(issue(path, `Required field "${field.label}" is missing or null`));
    }
    return issues;
  }

  if (typeof value === "string" && value.length > 0 && value.trim() === "") {
    issues.push(issue(path, `${field.label} cannot be only whitespace`));
    return issues;
  }

  switch (field.kind) {
    case "string": {
      if (typeof value !== "string") {
        issues.push(issue(path, `Type mismatch: expected string, got ${typeof value}`));
      }
      break;
    }
    case "cuid": {
      if (typeof value !== "string" || !CUID_REGEX.test(value)) {
        issues.push(issue(path, "Type mismatch: expected valid CUID string"));
      }
      break;
    }
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        issues.push(issue(path, `Type mismatch: expected number, got ${typeof value}`));
      }
      break;
    }
    case "boolean": {
      if (typeof value !== "boolean") {
        issues.push(issue(path, `Type mismatch: expected boolean, got ${typeof value}`));
      }
      break;
    }
    case "enum": {
      if (typeof value !== "string") {
        issues.push(issue(path, `Type mismatch: expected enum string, got ${typeof value}`));
        break;
      }
      if (field.enumValues?.length && !field.enumValues.includes(value)) {
        issues.push(
          issue(path, `Invalid enum value. Allowed: ${field.enumValues.join(", ")}`),
        );
      }
      break;
    }
    case "array": {
      if (!Array.isArray(value)) {
        issues.push(issue(path, `Type mismatch: expected array, got ${typeof value}`));
      }
      break;
    }
    default:
      break;
  }

  return issues;
}

/** Validates POST /api/chat response shape for a specific instruction version. */
export function validateChatOutputResponse(
  fields: PromptIoFieldSchema[],
  raw: unknown,
  context: OutputValidationContext,
): PayloadValidationResult {
  const issues: ValidationIssue[] = [];

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      issues: [issue("_root", "Response must be a JSON object")],
      normalized: null,
    };
  }

  const payload = raw as Record<string, unknown>;

  for (const field of fields) {
    if (field.kind === "server-only") continue;
    issues.push(...validateOutputField(field, payload[field.key]));
  }

  const versionId = payload.instructionVersionId;
  if (
    typeof versionId === "string" &&
    versionId !== context.instructionVersionId
  ) {
    issues.push(
      issue(
        "instructionVersionId",
        `Version mismatch: expected ${context.instructionVersionId}, got ${versionId}`,
      ),
    );
  }

  const versionNum = payload.instructionVersionNumber;
  if (
    versionNum !== undefined &&
    versionNum !== null &&
    typeof versionNum === "number" &&
    versionNum !== context.versionNumber
  ) {
    issues.push(
      issue(
        "instructionVersionNumber",
        `Version number mismatch: expected ${context.versionNumber}, got ${versionNum}`,
      ),
    );
  }

  const zodResult = z
    .object({
      conversationId: z.string().cuid(),
      reply: z.string().trim().min(1),
      instructionVersionId: z.string().cuid().nullable(),
      instructionVersionNumber: z.number().int().positive().nullable().optional(),
      instructionSource: z.enum(["published", "draft", "default"]),
      safetyHandled: z.boolean(),
      isAdminTest: z.boolean().optional(),
    })
    .safeParse(payload);

  if (!zodResult.success) {
    for (const err of zodResult.error.errors) {
      issues.push(issue(err.path.join(".") || "_root", err.message));
    }
  }

  if (issues.length > 0) {
    return { valid: false, issues, normalized: null };
  }

  return {
    valid: true,
    issues: [],
    normalized: zodResult.success
      ? (zodResult.data as Record<string, unknown>)
      : payload,
  };
}

/** @deprecated Use canActivatePromptVersion from @/lib/activation/can-activate-prompt-version */
export function canActivatePromptVersionLegacy(outputValid: boolean): {
  allowed: boolean;
  reason: string | null;
} {
  if (!outputValid) {
    return {
      allowed: false,
      reason: "Output schema validation must pass before activating or publishing this version.",
    };
  }
  return { allowed: true, reason: null };
}

export { canActivatePromptVersion } from "@/lib/activation/can-activate-prompt-version";
