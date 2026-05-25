import { isProtectedAdminPath } from "@/lib/auth/protected-routes";

const DEFAULT_ADMIN_HOME = "/admin";

/**
 * Resolve a safe post-login path from middleware `?next=` (open-redirect safe).
 */
export function resolvePostLoginRedirect(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_ADMIN_HOME;
  }

  if (next === "/login" || next.startsWith("/login?")) {
    return DEFAULT_ADMIN_HOME;
  }

  if (next === "/access-denied") {
    return DEFAULT_ADMIN_HOME;
  }

  return isProtectedAdminPath(next) ? next : DEFAULT_ADMIN_HOME;
}
