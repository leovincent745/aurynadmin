import type { Prisma } from "@prisma/client";
import { UserRole } from "@prisma/client";

import type {
  UserListItem,
  UserListResponse,
  UserProfileDetail,
  UserProfileFields,
} from "@/lib/domain/user-profiles";
import { prisma } from "@/lib/db/prisma";

export class UserServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND",
  ) {
    super(message);
    this.name = "UserServiceError";
  }
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  email?: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function mapProfileFields(
  profile: {
    displayName: string | null;
    wellnessGoal: string | null;
    physicianPractice: string | null;
    activeProtocol: string | null;
    allergiesRestrictions: string | null;
    preferences: string | null;
    memorySummary: string | null;
  } | null,
): UserProfileFields | null {
  if (!profile) return null;
  return {
    displayName: profile.displayName,
    wellnessGoal: profile.wellnessGoal,
    physicianPractice: profile.physicianPractice,
    activeProtocol: profile.activeProtocol,
    allergiesRestrictions: profile.allergiesRestrictions,
    preferences: profile.preferences,
    memorySummary: profile.memorySummary,
  };
}

export async function listUsers(query: ListUsersQuery): Promise<UserListResponse> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(Math.max(1, query.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    role: UserRole.user,
  };

  if (query.email?.trim()) {
    where.email = { contains: query.email.trim(), mode: "insensitive" };
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        profile: { select: { displayName: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const items: UserListItem[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    displayName: row.profile?.displayName ?? null,
    createdAt: row.createdAt.toISOString(),
    hasProfile: Boolean(row.profile),
  }));

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getUserProfile(id: string): Promise<UserProfileDetail | null> {
  const row = await prisma.user.findFirst({
    where: { id, role: UserRole.user },
    include: {
      profile: true,
      _count: {
        select: {
          conversations: { where: { isAdminTest: false } },
        },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    profile: mapProfileFields(row.profile),
    conversationCount: row._count.conversations,
  };
}
