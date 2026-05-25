export interface ConversationListItem {
  id: string;
  participant: string;
  participantType: "user" | "guest";
  /** Set when participant is a logged-in user (role `user`). */
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastInstructionVersion: number | null;
  lastInstructionVersionId: string | null;
  messageCount: number;
  flaggedForReview: boolean;
}

export interface ConversationListResponse {
  items: ConversationListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConversationMessageItem {
  id: string;
  sender: "user" | "auryn";
  content: string;
  createdAt: string;
  instructionVersionId: string | null;
  instructionVersionNumber: number | null;
}

export interface ConversationDetail {
  id: string;
  participant: string;
  participantType: "user" | "guest";
  userId: string | null;
  anonymousSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  flaggedForReview: boolean;
  flaggedAt: string | null;
  flaggedNote: string | null;
  messages: ConversationMessageItem[];
}
