export const SESSION_COOKIE_NAME = "auryn_session";

/** Roles allowed to access the admin console (including read-only viewer). */
export const ADMIN_ROLES = [
  "admin",
  "super_admin",
  "developer",
  "reviewer",
  "physician",
  "viewer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
