import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getPromptSystemPermissions,
  hasPromptPermission,
} from "@/lib/auth/prompt-permissions";
import type { UserRole } from "@prisma/client";

function perms(role: UserRole) {
  return getPromptSystemPermissions(role);
}

test("admin and super_admin have full prompt permissions", () => {
  for (const role of ["admin", "super_admin"] as const) {
    const p = perms(role);
    assert.equal(p.canView, true);
    assert.equal(p.canCreate, true);
    assert.equal(p.canEdit, true);
    assert.equal(hasPromptPermission(p, "validate"), true);
    assert.equal(hasPromptPermission(p, "approve"), true);
    assert.equal(hasPromptPermission(p, "activate"), true);
    assert.equal(hasPromptPermission(p, "rollback"), true);
    assert.equal(hasPromptPermission(p, "archive"), true);
  }
});

test("non-admin roles have no prompt system access in Step 1", () => {
  for (const role of ["user", "developer", "reviewer", "physician", "viewer"] as const) {
    const p = perms(role);
    assert.equal(p.canView, false);
    assert.equal(p.canCreate, false);
    assert.equal(p.canEdit, false);
    assert.equal(hasPromptPermission(p, "validate"), false);
    assert.equal(hasPromptPermission(p, "activate"), false);
  }
});
