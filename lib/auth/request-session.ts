import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "./constants";
import { verifySessionToken } from "./session";
import type { SessionUser } from "./types";

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
