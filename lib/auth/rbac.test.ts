import assert from "node:assert/strict";
import { test } from "node:test";

import { isAdminRole } from "@/lib/auth/rbac";

test("isAdminRole allows admin and super_admin only", () => {
  assert.equal(isAdminRole("admin"), true);
  assert.equal(isAdminRole("super_admin"), true);
  assert.equal(isAdminRole("user"), false);
  assert.equal(isAdminRole("developer"), false);
  assert.equal(isAdminRole("reviewer"), false);
  assert.equal(isAdminRole("physician"), false);
  assert.equal(isAdminRole("viewer"), false);
});
