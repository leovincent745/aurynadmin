/**
 * Domain types for chat, admin instructions, and AI logging tables.
 * Mirrors prisma/schema.prisma — use for frontend/API contracts before Prisma client is wired.
 */

export type EntityId = string;
export type IsoDateTime = string;

// ---------------------------------------------------------------------------
// admin_instructions
// ---------------------------------------------------------------------------

export const adminInstructionStatuses = ["draft", "published", "archived"] as const;
export type AdminInstructionStatus = (typeof adminInstructionStatuses)[number];

export interface AdminInstruction {
  id: EntityId;
  version_number: number;
  master_instructions: string;
  company_guardrails: string;
  product_protocol_rules: string;
  status: AdminInstructionStatus;
  created_by: EntityId;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  published_at: IsoDateTime | null;
}

// ---------------------------------------------------------------------------
// messages
// ---------------------------------------------------------------------------

export const messageSenders = ["user", "auryn"] as const;
export type MessageSender = (typeof messageSenders)[number];

export interface Message {
  id: EntityId;
  conversation_id: EntityId;
  sender: MessageSender;
  content: string;
  /** Required when sender is `auryn`; nullable in storage for user messages. */
  instruction_version_id: EntityId | null;
  created_at: IsoDateTime;
}

export function messageRequiresInstructionVersion(sender: MessageSender): boolean {
  return sender === "auryn";
}

// ---------------------------------------------------------------------------
// ai_logs
// ---------------------------------------------------------------------------

export const aiLogEventTypes = [
  "chat_success",
  "chat_error",
  "safety_escalation",
  "safety_refusal",
] as const;
export type AiLogEventType = (typeof aiLogEventTypes)[number];

export interface AiLog {
  id: EntityId;
  event_type: AiLogEventType;
  conversation_id: EntityId;
  user_id: EntityId | null;
  anonymous_session_id: string | null;
  instruction_version_id: EntityId | null;
  status: string;
  error_summary: string | null;
  created_at: IsoDateTime;
}

// ---------------------------------------------------------------------------
// Supporting tables (minimum viable fields)
// ---------------------------------------------------------------------------

export const userRoles = ["user", "admin", "super_admin"] as const;
export type UserRole = (typeof userRoles)[number];

export interface User {
  id: EntityId;
  email: string;
  role: UserRole;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface UserProfile {
  id: EntityId;
  user_id: EntityId;
  display_name: string | null;
  wellness_goal: string | null;
  physician_practice: string | null;
  active_protocol: string | null;
  allergies_restrictions: string | null;
  preferences: string | null;
  memory_summary: string | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}

export interface Conversation {
  id: EntityId;
  user_id: EntityId | null;
  anonymous_session_id: string | null;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
}
