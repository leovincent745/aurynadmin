import type { UserRole } from "@prisma/client";

import { ADMIN_ROLES } from "./constants";

export function isAdminRole(role: UserRole): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}
