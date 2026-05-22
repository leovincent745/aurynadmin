import type { User } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { isAdminRole } from "@/lib/auth/rbac";
import { signSession } from "@/lib/auth/session";
import type { PublicUser, SessionUser } from "@/lib/auth/types";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, role: user.role };
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: PublicUser }> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password");
  }

  if (!isAdminRole(user.role)) {
    throw new AuthError("Invalid email or password");
  }

  const sessionUser: SessionUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = await signSession(sessionUser);
  return { token, user: toPublicUser(user) };
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return toPublicUser(user);
}
