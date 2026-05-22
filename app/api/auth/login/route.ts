import { NextResponse } from "next/server";
import { z } from "zod";

import { logAuthEvent } from "@/lib/auth/audit-log";
import { checkLoginRateLimit, recordLoginFailure } from "@/lib/auth/login-rate-limit";
import { sessionCookieOptions } from "@/lib/auth/session";
import { AuthError, loginWithEmailPassword } from "@/lib/services/auth-service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "local";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { code: "RATE_LIMITED", message: "Too many login attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    const { token, user } = await loginWithEmailPassword(parsed.data.email, parsed.data.password);
    logAuthEvent("auth.login.success", { email: user.email, userId: user.id });

    const response = NextResponse.json({ user });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      recordLoginFailure(ip);
      logAuthEvent("auth.login.failure", { email: parsed.data.email, reason: "invalid_credentials" });
      return NextResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        { status: 401 },
      );
    }

    console.error("auth.login.error", error);
    return NextResponse.json({ code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
