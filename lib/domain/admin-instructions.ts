import type { AdminInstructionStatus } from "@prisma/client";

import type { VersionTraceabilityDto } from "@/lib/domain/prompt-history";

export interface InstructionContent {
  masterInstructions: string;
  companyGuardrails: string;
  productProtocolRules: string;
}

export interface InstructionRecord {
  id: string;
  versionNumber: number;
  status: AdminInstructionStatus;
  masterInstructions: string;
  companyGuardrails: string;
  productProtocolRules: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CurrentDraftResponse {
  draft: InstructionRecord | null;
  isNew: boolean;
  nextVersionNumber: number;
  activePublished: {
    versionNumber: number;
    publishedAt: string;
    publishedByEmail: string;
  } | null;
}

export interface InstructionHistoryListItem {
  id: string;
  versionNumber: number;
  status: AdminInstructionStatus;
  createdByEmail: string;
  createdAt: string;
  publishedAt: string | null;
  isCurrentlyLive: boolean;
  wasPreviouslyLive: boolean;
  traceability: VersionTraceabilityDto;
}

export interface InstructionHistoryResponse {
  items: InstructionHistoryListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
