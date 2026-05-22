import { z } from "zod";

import type {
  PayloadValidationResult,
  PromptIoFieldSchema,
  ValidationIssue,
} from "@/lib/domain/prompt-io-schema";

const CUID_REGEX = /^c[a-z0-9]{24}$/i;

function issue(path: string, message: string): ValidationIssue {
  return { path, message };
}

function isUnsafeEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.length > 0 && value.trim() === "";
}

function validateField(
  field: PromptIoFieldSchema,
  value: unknown,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const path = field.key;

  if (value === undefined || value === null || value === "") {
    if (field.required && field.editable) {
      issues.push(issue(path, `${field.label} is required`));
    }
    return issues;
  }

  if (isUnsafeEmptyString(value)) {
    issues.push(issue(path, `${field.label} cannot be only whitespace`));
    return issues;
  }

  switch (field.kind) {
    case "string": {
      if (typeof value !== "string") {
        issues.push(issue(path, "Must be a string"));
        break;
      }
      const len = value.trim().length;
      if (field.minLength != null && len < field.minLength) {
        issues.push(issue(path, `Minimum length is ${field.minLength}`));
      }
      if (field.maxLength != null && len > field.maxLength) {
        issues.push(issue(path, `Maximum length is ${field.maxLength}`));
      }
      break;
    }
    case "cuid": {
      if (typeof value !== "string" || !CUID_REGEX.test(value)) {
        issues.push(issue(path, "Must be a valid CUID"));
      }
      break;
    }
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) {
        issues.push(issue(path, "Must be a number"));
        break;
      }
      if (field.min != null && value < field.min) {
        issues.push(issue(path, `Minimum value is ${field.min}`));
      }
      if (field.max != null && value > field.max) {
        issues.push(issue(path, `Maximum value is ${field.max}`));
      }
      break;
    }
    case "boolean": {
      if (typeof value !== "boolean") {
        issues.push(issue(path, "Must be true or false"));
      }
      break;
    }
    case "enum": {
      if (typeof value !== "string") {
        issues.push(issue(path, "Must be a string"));
        break;
      }
      if (field.enumValues?.length && !field.enumValues.includes(value)) {
        issues.push(
          issue(path, `Must be one of: ${field.enumValues.join(", ")}`),
        );
      }
      break;
    }
    case "array": {
      if (!Array.isArray(value)) {
        issues.push(issue(path, "Must be an array"));
        break;
      }
      if (field.minItems != null && value.length < field.minItems) {
        issues.push(issue(path, `At least ${field.minItems} item(s) required`));
      }
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item !== "string" || item.trim() === "") {
          issues.push(issue(`${path}[${i}]`, "Array items must be non-empty strings"));
        }
      }
      break;
    }
    default:
      break;
  }

  return issues;
}

/** Chat pipeline: mirrors POST /api/chat zod rules + schema fields. */
export function validateChatInputPayload(
  fields: PromptIoFieldSchema[],
  raw: unknown,
): PayloadValidationResult {
  const issues: ValidationIssue[] = [];

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      issues: [issue("_root", "Payload must be a JSON object")],
      normalized: null,
    };
  }

  const payload = raw as Record<string, unknown>;
  const editableFields = fields.filter((f) => f.editable);

  for (const field of editableFields) {
    issues.push(...validateField(field, payload[field.key]));
  }

  const hasUserId =
    typeof payload.userId === "string" && CUID_REGEX.test(payload.userId);
  const hasAnonymous =
    typeof payload.anonymousSessionId === "string" &&
    payload.anonymousSessionId.trim().length >= 1;

  if (!hasUserId && !hasAnonymous) {
    issues.push(
      issue(
        "userId",
        "Provide userId or anonymousSessionId (at least one is required)",
      ),
    );
  }

  if (issues.length > 0) {
    return { valid: false, issues, normalized: null };
  }

  const normalized: Record<string, unknown> = {};
  for (const field of editableFields) {
    const v = payload[field.key];
    if (v === undefined || v === null || v === "") continue;
    if (typeof v === "string") {
      normalized[field.key] = v.trim();
    } else {
      normalized[field.key] = v;
    }
  }

  const zodResult = z
    .object({
      message: z.string().trim().min(1).max(8_000),
      conversationId: z.string().cuid().optional(),
      userId: z.string().cuid().optional(),
      anonymousSessionId: z.string().trim().min(1).max(128).optional(),
    })
    .refine((d) => Boolean(d.userId || d.anonymousSessionId), {
      message: "userId or anonymousSessionId required",
      path: ["anonymousSessionId"],
    })
    .safeParse(normalized);

  if (!zodResult.success) {
    for (const err of zodResult.error.errors) {
      issues.push(issue(err.path.join(".") || "_root", err.message));
    }
    return { valid: false, issues, normalized: null };
  }

  return { valid: true, issues: [], normalized: zodResult.data as Record<string, unknown> };
}

export function validatePayloadAgainstSchema(
  fields: PromptIoFieldSchema[],
  raw: unknown,
  pipelineType: "chat_instructions" = "chat_instructions",
): PayloadValidationResult {
  if (pipelineType === "chat_instructions") {
    return validateChatInputPayload(fields, raw);
  }

  const issues: ValidationIssue[] = [];
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      valid: false,
      issues: [issue("_root", "Payload must be a JSON object")],
      normalized: null,
    };
  }
  const payload = raw as Record<string, unknown>;
  for (const field of fields.filter((f) => f.editable)) {
    issues.push(...validateField(field, payload[field.key]));
  }
  return {
    valid: issues.length === 0,
    issues,
    normalized: issues.length === 0 ? payload : null,
  };
}
