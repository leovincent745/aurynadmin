import type { UserRole } from "@prisma/client";

export interface UserProfileFields {
  displayName: string | null;
  wellnessGoal: string | null;
  physicianPractice: string | null;
  activeProtocol: string | null;
  allergiesRestrictions: string | null;
  preferences: string | null;
  memorySummary: string | null;
}

export interface UserListItem {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  hasProfile: boolean;
}

export interface UserListResponse {
  items: UserListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserProfileDetail {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile: UserProfileFields | null;
  conversationCount: number;
}
