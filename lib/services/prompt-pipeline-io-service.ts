import { AdminInstructionStatus } from "@prisma/client";

import type { PromptIoFieldSchema } from "@/lib/domain/prompt-io-schema";
import type { PromptPipelineIoResponse } from "@/lib/domain/prompt-pipeline-io";
import { prisma } from "@/lib/db/prisma";

function pipelineCode(versionNumber: number): string {
  return `PROMPT-CHAT-${String(versionNumber).padStart(3, "0")}`;
}

function statusLabel(status: AdminInstructionStatus): string {
  switch (status) {
    case AdminInstructionStatus.published:
      return "published";
    case AdminInstructionStatus.draft:
      return "draft";
    case AdminInstructionStatus.archived:
      return "archived";
    default:
      return "archived";
  }
}

/**
 * Step 1: Auryn Chat Instructions pipeline — IO derived from real `/api/chat` and `ai_logs` contracts.
 * Future multi-pipeline schemas will use stored JSON per version (see developer guide §19).
 */
export function buildChatInstructionsPipelineIo(params: {
  instructionId: string;
  versionNumber: number;
  status: AdminInstructionStatus;
}): PromptPipelineIoResponse {
  const { instructionId, versionNumber, status } = params;
  const code = pipelineCode(versionNumber);
  const statusStr = statusLabel(status);

  const exampleMessage = "What gentle habits support sleep without supplements?";

  const inputFields: PromptIoFieldSchema[] = [
    {
      key: "message",
      label: "User message",
      description: "Trimmed user text sent in the request body.",
      type: "string",
      kind: "string",
      required: true,
      editable: true,
      source: "client_chat_ui",
      validation: "trim · min 1 · max 8000",
      minLength: 1,
      maxLength: 8000,
    },
    {
      key: "conversationId",
      label: "Session thread",
      description: "Optional CUID to continue an existing conversation.",
      type: "cuid",
      kind: "cuid",
      required: false,
      editable: true,
      source: "conversations.id",
    },
    {
      key: "userId",
      label: "Authenticated user",
      description: "CUID of logged-in user. Required unless anonymousSessionId is set.",
      type: "cuid",
      kind: "cuid",
      required: false,
      editable: true,
      source: "users.id",
      validation: "userId XOR anonymousSessionId",
    },
    {
      key: "anonymousSessionId",
      label: "Anonymous session",
      description: "Stable anonymous session key for public chat.",
      type: "string",
      kind: "string",
      required: false,
      editable: true,
      source: "client_session",
      validation: "userId XOR anonymousSessionId",
      minLength: 1,
      maxLength: 128,
    },
    {
      key: "instructionVersion",
      label: "Instruction version",
      description: `Server resolves published instructions. This row: v${versionNumber} (${statusStr}).`,
      type: "server",
      kind: "server-only",
      required: true,
      editable: false,
      source: "admin_instructions",
    },
    {
      key: "safetyLayer",
      label: "Safety layer",
      description: "Deterministic safety checks before OpenAI.",
      type: "server",
      kind: "server-only",
      required: true,
      editable: false,
      source: "lib/ai/safety.ts",
    },
  ];

  const examplePayload: Record<string, unknown> = {
    message: exampleMessage,
    conversationId: "",
    userId: "",
    anonymousSessionId: "demo-anon-session-001",
  };

  return {
    pipelineType: "chat_instructions",
    instructionId,
    versionNumber,
    status: statusStr,
    pipelineName: "Auryn Chat Instructions",
    pipelineCode: code,
    inputs: {
      endpoint: "POST /api/chat",
      requiredKeys: ["message", "userId|anonymousSessionId"],
      exampleJson: examplePayload,
      editableKeys: inputFields.filter((f) => f.editable).map((f) => f.key),
      fields: inputFields,
      schemaVersion: "chat-input-v1",
      versionLabel: `v${versionNumber} (${statusStr})`,
      instructionVersionId: instructionId,
    },
    outputs: {
      endpoint: "POST /api/chat response + persistence",
      requiredKeys: ["conversationId", "reply", "instructionVersionId"],
      exampleJson: {
        conversationId: instructionId,
        reply: "Auryn assistant text shown to the user.",
        instructionVersionId: instructionId,
        instructionVersionNumber: versionNumber,
        instructionSource:
          status === AdminInstructionStatus.published ? "published" : "draft",
        safetyHandled: false,
        isAdminTest: false,
      },
      editableKeys: [],
      schemaVersion: "chat-output-v1",
      versionLabel: `v${versionNumber} (${statusStr})`,
      instructionVersionId: instructionId,
      fields: [
        {
          key: "conversationId",
          label: "Conversation ID",
          description: "CUID for the conversation thread.",
          type: "cuid",
          kind: "cuid",
          required: true,
          editable: false,
          source: "POST /api/chat response",
          downstream: "Conversations admin, Test Chat",
        },
        {
          key: "reply",
          label: "Auryn reply",
          description: "Assistant message returned to the client.",
          type: "string",
          kind: "string",
          required: true,
          editable: false,
          source: "messages",
          downstream: "Chat UI, Conversation Review",
        },
        {
          key: "safetyOutcome",
          label: "Safety outcome (ai_logs)",
          description:
            "Derived event_type written to ai_logs — not in the HTTP JSON body.",
          type: "enum",
          kind: "server-only",
          required: false,
          editable: false,
          source: "ai_logs",
          downstream: "AI Logs / Safety Logs admin page",
          enumValues: [
            "chat_success",
            "safety_escalation",
            "safety_refusal",
            "chat_error",
          ],
        },
        {
          key: "instructionVersionId",
          label: "Version trace",
          description: `instruction_version_id = ${instructionId}`,
          type: "cuid",
          kind: "cuid",
          required: true,
          editable: false,
          source: "messages.instruction_version_id",
          downstream: "Prompt System history, analytics",
        },
        {
          key: "chatError",
          label: "Error path (ai_logs)",
          description: "When OpenAI fails, error summary is stored on ai_logs only.",
          type: "string",
          kind: "server-only",
          required: false,
          editable: false,
          source: "ai_logs",
          downstream: "AI Logs admin alerts",
        },
        {
          key: "instructionSource",
          label: "Instruction source",
          description: "published | draft | default",
          type: "enum",
          kind: "enum",
          required: true,
          editable: false,
          source: "chat-service",
          enumValues: ["published", "draft", "default"],
        },
        {
          key: "safetyHandled",
          label: "Safety handled",
          description: "true when escalation/refusal short-circuited OpenAI.",
          type: "boolean",
          kind: "boolean",
          required: true,
          editable: false,
          source: "chat-service",
          downstream: "Test Chat UI indicator",
        },
        {
          key: "isAdminTest",
          label: "Admin test flag",
          description: "true when turn was run from admin test chat.",
          type: "boolean",
          kind: "boolean",
          required: false,
          editable: false,
          source: "chat-service",
        },
      ],
    },
  };
}

export async function getPromptPipelineIo(
  instructionId: string,
): Promise<PromptPipelineIoResponse | null> {
  const row = await prisma.adminInstruction.findUnique({
    where: { id: instructionId },
    select: { id: true, versionNumber: true, status: true },
  });

  if (!row) return null;

  return buildChatInstructionsPipelineIo({
    instructionId: row.id,
    versionNumber: row.versionNumber,
    status: row.status,
  });
}
