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
    assert.equal(p.canCreate, true);
    assert.equal(p.canEdit, true);
    assert.equal(hasPromptPermission(p, "validate"), true);
    assert.equal(hasPromptPermission(p, "approve"), true);
    assert.equal(hasPromptPermission(p, "activate"), true);
    assert.equal(hasPromptPermission(p, "rollback"), true);
    assert.equal(hasPromptPermission(p, "archive"), true);
  }
});

test("developer can create edit validate submit but not approve or activate", () => {
  const p = perms("developer");
  assert.equal(p.canCreate, true);
  assert.equal(p.canEdit, true);
  assert.equal(hasPromptPermission(p, "validate"), true);
  assert.equal(hasPromptPermission(p, "submit-review"), true);
  assert.equal(hasPromptPermission(p, "approve"), false);
  assert.equal(hasPromptPermission(p, "activate"), false);
  assert.equal(hasPromptPermission(p, "rollback"), false);
});

test("reviewer can only approve", () => {
  const p = perms("reviewer");
  assert.equal(p.canView, true);
  assert.equal(p.canApproveReview, true);
  assert.equal(p.canEdit, false);
  assert.equal(hasPromptPermission(p, "submit-review"), false);
});

test("physician can only record physician approval", () => {
  const p = perms("physician");
  assert.equal(hasPromptPermission(p, "physician-approval"), true);
  assert.equal(p.canEdit, false);
  assert.equal(hasPromptPermission(p, "approve"), false);
});

test("viewer is read-only", () => {
  const p = perms("viewer");
  assert.equal(p.canView, true);
  assert.equal(p.canCreate, false);
  assert.equal(p.canEdit, false);
  assert.equal(hasPromptPermission(p, "validate"), false);
});

test("end user has no prompt access", () => {
  const p = perms("user");
  assert.equal(p.canView, false);
});
