/** URL prefixes that require an authenticated admin or super_admin session. */
export const PROTECTED_ADMIN_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/prompt-system",
  "/ai-optimization-center",
  "/conversations",
  "/users",
  "/test-chat",
  "/root-pathways",
] as const;

export function isProtectedAdminPath(pathname: string): boolean {
  return PROTECTED_ADMIN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
