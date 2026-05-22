import { describe, expect, it } from "vitest";

import type { PromptIoFieldSchema } from "@/lib/domain/prompt-io-schema";
import { validateChatOutputResponse } from "@/lib/validation/prompt-io-output";

const instructionId = "cl00000000000000000000001";

const fields: PromptIoFieldSchema[] = [
  {
    key: "conversationId",
    label: "Conversation",
    description: "",
    type: "cuid",
    kind: "cuid",
    required: true,
    editable: false,
    source: "db",
  },
  {
    key: "reply",
    label: "Reply",
    description: "",
    type: "string",
    kind: "string",
    required: true,
    editable: false,
    source: "db",
  },
  {
    key: "instructionVersionId",
    label: "Version",
    description: "",
    type: "cuid",
    kind: "cuid",
    required: true,
    editable: false,
    source: "db",
  },
  {
    key: "instructionSource",
    label: "Source",
    description: "",
    type: "enum",
    kind: "enum",
    required: true,
    editable: false,
    source: "db",
    enumValues: ["published", "draft", "default"],
  },
  {
    key: "safetyHandled",
    label: "Safety",
    description: "",
    type: "boolean",
    kind: "boolean",
    required: true,
    editable: false,
    source: "db",
  },
];

const context = { instructionVersionId: instructionId, versionNumber: 2 };

describe("validateChatOutputResponse", () => {
  it("accepts a valid response", () => {
    const result = validateChatOutputResponse(
      fields,
      {
        conversationId: instructionId,
        reply: "Hello",
        instructionVersionId: instructionId,
        instructionVersionNumber: 2,
        instructionSource: "draft",
        safetyHandled: false,
      },
      context,
    );
    expect(result.valid).toBe(true);
  });

  it("detects missing required fields and nulls", () => {
    const result = validateChatOutputResponse(
      fields,
      { conversationId: instructionId, reply: null },
      context,
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "reply")).toBe(true);
  });

  it("detects enum and type mismatches", () => {
    const result = validateChatOutputResponse(
      fields,
      {
        conversationId: instructionId,
        reply: "Hi",
        instructionVersionId: instructionId,
        instructionSource: "invalid",
        safetyHandled: "no",
      },
      context,
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "instructionSource")).toBe(true);
    expect(result.issues.some((i) => i.path === "safetyHandled")).toBe(true);
  });

  it("detects version id mismatch", () => {
    const result = validateChatOutputResponse(
      fields,
      {
        conversationId: instructionId,
        reply: "Hi",
        instructionVersionId: "cl00000000000000000000002",
        instructionSource: "draft",
        safetyHandled: false,
      },
      context,
    );
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.path === "instructionVersionId")).toBe(true);
  });
});
