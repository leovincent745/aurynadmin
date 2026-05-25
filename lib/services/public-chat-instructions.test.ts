import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { InstructionSetForChat } from "@/lib/services/instruction-service";
import {
  assertPublicChatInstructionSet,
  instructionVersionIdForAurynMessage,
  PublicChatInstructionError,
} from "@/lib/services/public-chat-instructions";

const content = {
  masterInstructions: "test",
  companyGuardrails: "test",
  productProtocolRules: "test",
};

describe("public chat instructions", () => {
  it("rejects draft source for public chat", () => {
    const draftSet: InstructionSetForChat = {
      instructionId: "cldraft00000000000000001",
      versionNumber: 1,
      content,
      source: "draft",
    };
    assert.throws(
      () => assertPublicChatInstructionSet(draftSet),
      (err: unknown) => err instanceof PublicChatInstructionError,
    );
  });

  it("allows published and default sources", () => {
    assertPublicChatInstructionSet({
      instructionId: "clpub000000000000000001",
      versionNumber: 2,
      content,
      source: "published",
    });
    assertPublicChatInstructionSet({
      instructionId: null,
      versionNumber: null,
      content,
      source: "default",
    });
  });

  it("requires instruction id when source is published", () => {
    assert.throws(
      () =>
        instructionVersionIdForAurynMessage({
          instructionId: null,
          versionNumber: 1,
          content,
          source: "published",
        }),
      (err: unknown) => err instanceof PublicChatInstructionError,
    );
  });

  it("returns null version id for default fallback", () => {
    assert.equal(
      instructionVersionIdForAurynMessage({
        instructionId: null,
        versionNumber: null,
        content,
        source: "default",
      }),
      null,
    );
  });
});
