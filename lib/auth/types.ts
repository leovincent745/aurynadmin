import type { UserRole } from "@prisma/client";

export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
}
