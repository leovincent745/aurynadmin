export const aiLogEventTypes = [
  "chat_success",
  "chat_error",
  "safety_escalation",
  "safety_refusal",
] as const;

export type AiLogEventType = (typeof aiLogEventTypes)[number];

export interface AiLogListItem {
  id: string;
  eventType: AiLogEventType;
  createdAt: string;
  status: string;
  conversationId: string;
  isAdminTest: boolean;
  participant: string;
  participantType: "user" | "guest" | "admin";
  instructionVersionNumber: number | null;
  errorSummaryPreview: string | null;
}

export interface AiLogListResponse {
  items: AiLogListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AiLogDetail {
  id: string;
  eventType: AiLogEventType;
  createdAt: string;
  status: string;
  conversationId: string;
  isAdminTest: boolean;
  participant: string;
  participantType: "user" | "guest" | "admin";
  userId: string | null;
  anonymousSessionId: string | null;
  instructionVersionId: string | null;
  instructionVersionNumber: number | null;
  errorSummary: string | null;
}
