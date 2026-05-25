import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  aiLogsHrefForInstructionVersion,
  conversationsHrefForInstructionVersion,
  promptSystemHistoryTabHref,
  promptSystemOverviewHref,
} from "@/lib/prompt-system/version-history-links";
import { conversationsHrefForUserEmail, userProfileHref } from "@/lib/admin/user-review-links";
import { isProtectedAdminPath, PROTECTED_ADMIN_PATH_PREFIXES } from "@/lib/auth/protected-routes";
import { isAdminRole } from "@/lib/auth/rbac";
import { getStep1AdminNavItems } from "@/components/navigation/step1-admin-nav";
import { testChatHrefForPipeline } from "@/lib/prompt-system/row-actions";
import type { PromptPipelineListItem } from "@/lib/domain/prompt-pipelines";

const samplePipeline = (overrides: Partial<PromptPipelineListItem>): PromptPipelineListItem => ({
  id: "clinstr00000000000000001",
  name: "Auryn Chat Instructions",
  code: "PROMPT-CHAT-001",
  versionNumber: 1,
  status: "Draft",
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("Step 1 admin workflow connections", () => {
  it("deep links include instruction version filters for logs and conversations", () => {
    const id = "clversion000000000000001";
    assert.match(aiLogsHrefForInstructionVersion(id), /instructionVersionId=clversion/);
    assert.match(conversationsHrefForInstructionVersion(id), /instructionVersionId=clversion/);
  });

  it("prompt system links select pipeline and tab", () => {
    const id = "clprompt000000000000001";
    assert.match(promptSystemOverviewHref(id), /selected=clprompt/);
    assert.match(promptSystemOverviewHref(id), /tab=overview/);
    assert.match(promptSystemHistoryTabHref(id), /tab=history/);
  });

  it("user review links connect profiles and conversations", () => {
    assert.equal(conversationsHrefForUserEmail("a@b.com"), "/conversations?email=a%40b.com");
    assert.equal(userProfileHref("cluser00000000000000001"), "/users/cluser00000000000000001");
  });

  it("test chat href passes draft vs published mode and instruction id", () => {
    const draft = testChatHrefForPipeline(
      samplePipeline({ status: "Draft", versionNumber: 3 }),
    );
    assert.match(draft, /mode=draft/);
    assert.match(draft, /instructionId=clinstr/);
    assert.match(draft, /version=3/);

    const live = testChatHrefForPipeline(
      samplePipeline({ status: "Active", versionNumber: 2 }),
    );
    assert.match(live, /mode=published/);
    assert.doesNotMatch(live, /mode=draft/);
  });

  it("protects all Step 1 admin surfaces", () => {
    for (const prefix of PROTECTED_ADMIN_PATH_PREFIXES) {
      assert.equal(isProtectedAdminPath(prefix), true, prefix);
      assert.equal(isProtectedAdminPath(`${prefix}/nested`), true, `${prefix}/nested`);
    }
    assert.equal(isProtectedAdminPath("/login"), false);
    assert.equal(isProtectedAdminPath("/api/chat"), false);
  });

  it("nav marks future deck modules non-navigable", () => {
    const items = getStep1AdminNavItems("/prompt-system");
    const future = items.filter((i) => i.availability === "future");
    assert.ok(future.length > 0);
    for (const item of future) {
      assert.equal(item.href, undefined, item.label);
    }
    const active = items.filter((i) => i.availability === "active");
    for (const item of active) {
      assert.ok(item.href, `${item.label} should have href`);
    }
  });

  it("blocks non-admin roles from admin console", () => {
    assert.equal(isAdminRole("user"), false);
    assert.equal(isAdminRole("admin"), true);
  });
});
