type AuthEvent = "auth.login.success" | "auth.login.failure";
type AdminEvent =
  | "admin.access.denied"
  | "instruction.draft.saved"
  | "instruction.published"
  | "conversation.flagged"
  | "prompt.audit";

export type PromptAuditLogEvent =
  | "version_created"
  | "draft_saved"
  | "published"
  | "archived"
  | "activated"
  | "rollback"
  | "validation_run"
  | "review_submitted"
  | "review_decided";

export function logAuthEvent(
  event: AuthEvent,
  meta: { email?: string; userId?: string; reason?: string },
): void {
  console.info(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
}

export function logAdminAccessDenied(meta: {
  userId?: string;
  role?: string;
  path: string;
}): void {
  console.info(
    JSON.stringify({
      event: "admin.access.denied" satisfies AdminEvent,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
}

export function logInstructionEvent(
  event: "instruction.draft.saved" | "instruction.published",
  meta: {
    instructionId: string;
    versionNumber: number;
    adminUserId: string;
    previousPublishedId?: string;
  },
): void {
  console.info(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
}

export function logPromptAuditEvent(
  event: PromptAuditLogEvent,
  meta: {
    instructionId: string;
    actorUserId: string;
    actorEmail?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  console.info(
    JSON.stringify({
      event: "prompt.audit" satisfies AdminEvent,
      auditEvent: event,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
}

export function logConversationFlagged(meta: {
  conversationId: string;
  adminUserId: string;
  flagged: boolean;
}): void {
  console.info(
    JSON.stringify({
      event: "conversation.flagged" satisfies AdminEvent,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
}
