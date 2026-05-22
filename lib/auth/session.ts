import { SignJWT, jwtVerify } from "jose";

import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./constants";
import type { SessionUser } from "./types";

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.userId,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const userId = payload.sub;
    const email = payload.email;
    const role = payload.role;

    if (typeof userId !== "string" || typeof email !== "string" || typeof role !== "string") {
      return null;
    }

    return { userId, email, role: role as SessionUser["role"] };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  const secure = process.env.NODE_ENV === "production";

  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
